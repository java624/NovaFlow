const response = await fetch("https://vagrglarsxjtnsusyonv.supabase.co/rest/v1/profiles?id=eq.123e4567-e89b-12d3-a456-426614174000", {
  method: 'PATCH',
  headers: {
    "apikey": "sb_publishable_mghDtAmpvA7Y2kCbtOY57w_MP15IpOK",
    "Authorization": "Bearer sb_publishable_mghDtAmpvA7Y2kCbtOY57w_MP15IpOK",
    "Content-Type": "application/json"
  },
  body: JSON.stringify({ learning_language: "english:test" })
});
console.log(await response.text());
