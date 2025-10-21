import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0] || 
                     req.headers.get('x-real-ip') || 
                     'unknown';

    console.log('Client IP:', clientIp);

    // Use ipapi.co for geolocation (free tier allows 1000 requests/day)
    const geoResponse = await fetch(`https://ipapi.co/${clientIp}/json/`);
    const geoData = await geoResponse.json();

    console.log('Geolocation data:', geoData);

    // Map location to NHL team
    const team = mapLocationToNHLTeam(geoData);

    return new Response(
      JSON.stringify({ 
        team,
        city: geoData.city,
        region: geoData.region,
        country: geoData.country_name
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    console.error('Error getting location:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        team: 'bruins' // Default to Boston Bruins
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  }
});

function mapLocationToNHLTeam(geoData: any): string {
  const region = geoData.region?.toLowerCase() || '';
  const city = geoData.city?.toLowerCase() || '';
  const country = geoData.country_code?.toLowerCase() || '';

  // Map by state/province and city
  if (country === 'ca') {
    // Canadian teams
    if (region.includes('ontario')) {
      if (city.includes('ottawa')) return 'senators';
      return 'maple-leafs'; // Toronto
    }
    if (region.includes('quebec')) return 'canadiens';
    if (region.includes('alberta')) {
      if (city.includes('calgary')) return 'flames';
      return 'oilers'; // Edmonton
    }
    if (region.includes('british columbia')) return 'canucks';
    if (region.includes('manitoba')) return 'jets';
  }

  // US teams by state
  if (region.includes('massachusetts') || city.includes('boston')) return 'bruins';
  if (region.includes('new york')) {
    if (city.includes('buffalo')) return 'sabres';
    if (city.includes('brooklyn') || city.includes('queens')) return 'islanders';
    return 'rangers'; // Default NYC
  }
  if (region.includes('pennsylvania')) {
    if (city.includes('pittsburgh')) return 'penguins';
    return 'flyers'; // Philadelphia
  }
  if (region.includes('michigan') || city.includes('detroit')) return 'red-wings';
  if (region.includes('florida')) {
    if (city.includes('tampa')) return 'lightning';
    return 'panthers'; // Miami/Sunrise
  }
  if (region.includes('new jersey')) return 'devils';
  if (region.includes('north carolina')) return 'hurricanes';
  if (region.includes('ohio') || city.includes('columbus')) return 'blue-jackets';
  if (region.includes('washington') && city.includes('dc')) return 'capitals';
  if (region.includes('arizona')) return 'coyotes';
  if (region.includes('illinois') || city.includes('chicago')) return 'blackhawks';
  if (region.includes('colorado') || city.includes('denver')) return 'avalanche';
  if (region.includes('texas') || city.includes('dallas')) return 'stars';
  if (region.includes('minnesota')) return 'wild';
  if (region.includes('tennessee') || city.includes('nashville')) return 'predators';
  if (region.includes('missouri') || city.includes('st. louis')) return 'blues';
  if (region.includes('california')) {
    if (city.includes('los angeles')) return 'kings';
    if (city.includes('anaheim')) return 'ducks';
    return 'sharks'; // San Jose
  }
  if (region.includes('washington') && !city.includes('dc')) return 'kraken'; // Seattle
  if (region.includes('nevada') || city.includes('las vegas')) return 'golden-knights';

  // Default to Bruins
  return 'bruins';
}
