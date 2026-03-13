fetch(
  "https://zenius-i-vanisher.com/v5.2/simfiles_search_ajax.php?songartist=huntrix",
  {
    method: "GET",
    mode: "no-cors",
    referrer: "",
    //   headers: {
    //     Accept: "*/*",
    //     "Content-Type": "application/x-www-form-urlencoded",
    //   },
  },
)
  .then((res) => {
    console.log(res.statusText);
    return res.text();
  })
  .then(console.log);
