function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
  }
  
  function setCookie(name, value, options = {}) {
    let cookieString = `${name}=${value}; path=/`;
    if (options.expires) {
      cookieString += `; expires=${options.expires.toUTCString()}`;
    }
    if (options.secure) {
      cookieString += '; secure';
    }
    if (options.httpOnly) {
      cookieString += '; HttpOnly';
    }
    document.cookie = cookieString;
  }
  
  function deleteCookie(name) {
    document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  }
  
  export { getCookie, setCookie, deleteCookie };