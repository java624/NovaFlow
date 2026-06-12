const response = await fetch("https://vagrglarsxjtnsusyonv.supabase.co/rest/v1/profiles?select=*&limit=1", {
  headers: {
    "apikey": "sb_publishable_mghDtAmpvA7Y2kCbtOY57w_MP15IpOK",
    "Authorization": "Bearer sb_publishable_mghDtAmpvA7Y2kCbtOY57w_MP15IpOK"
  }
});
const data = await response.json();
console.log(data);
