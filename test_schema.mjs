const response = await fetch("https://vagrglarsxjtnsusyonv.supabase.co/rest/v1/?apikey=sb_publishable_mghDtAmpvA7Y2kCbtOY57w_MP15IpOK");
const data = await response.json();
console.log(JSON.stringify(data.definitions.profiles.properties, null, 2));
