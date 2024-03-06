export function setCookie(cname, cvalue, ex, path) {
  let expires = "expires=" + new Date(ex ?? 2147483645000000).toUTCString();
  let cookie = cname + "=" + cvalue + `;` + expires + `;path=${path ?? "/"}`;
  document.cookie = cookie;
}

export function deleteCookie(name) {
  document.cookie = name + "=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;";
}

export function getAllCookies() {
  var pairs = document.cookie.split(";");
  var cookies = [];
  for (var i = 0; i < pairs.length; i++) {
    var pair = pairs[i].split("=");
    if(pair[0].length == 0) continue;
    cookies.push({
      name: pair[0],
      value: pair.slice(1).join("="),
    });
  }
  return cookies;
}

export function getCookie(cname) {
  let name = cname + "=";
  let decodedCookie = decodeURIComponent(document.cookie);
  let ca = decodedCookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == " ") {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return null;
}
