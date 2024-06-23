import LocalStorageConstants from "./LocalStorageConstants";

export const setTokenLocal = (token) => {
  localStorage.setItem(
    LocalStorageConstants.KEYS.JWTToken,
    JSON.stringify(token)
  );
};
export const getTokenLocal = () => {
  const tokenString = localStorage.getItem(LocalStorageConstants.KEYS.JWTToken);
  const userToken = JSON.parse(tokenString);
  return userToken;
};
export const setUserMapId = (token) => {
  localStorage.setItem(
    LocalStorageConstants.KEYS.user_map,
    JSON.stringify(token)
  );
};
export const getUserMapId = () => {
  const tokenString = localStorage.getItem(LocalStorageConstants.KEYS.user_map);
  const userToken = JSON.parse(tokenString);
  return userToken;
};
export const setOrgId = (token) => {
  localStorage.setItem(
    LocalStorageConstants.KEYS.org_id,
    JSON.stringify(token)
  );
};
export const getOrgLocal = () => {
  const tokenString = localStorage.getItem(LocalStorageConstants.KEYS.org_id);
  const userToken = JSON.parse(tokenString);
  return userToken;
};

export const GetErrorKey = (e, keyList) => {
  console.log("payload data in error", keyList);
  var errorKeys = [];
  var errorMessages = [];
  for (var key of keyList) {
    if (
      e.response &&
      e.response.status === 400 &&
      e.response.data &&
      e.response.data[key]
    ) {
      errorKeys.push(key);
      errorMessages.push(e.response.data[key][0]);
    }
  }
  console.log("get error funtion", errorKeys, errorMessages);
  return [errorKeys, errorMessages];
};
export const setRoleLocal = (role) => {
  localStorage.setItem(LocalStorageConstants.KEYS.role, JSON.stringify(role));
};
export const setNameLocal = (name) => {
  localStorage.setItem(LocalStorageConstants.KEYS.name, JSON.stringify(name));
};
export const getRoleLocal = () => {
  const roleString = localStorage.getItem(LocalStorageConstants.KEYS.role);
  const userRole = JSON.parse(roleString);
  return userRole;
};
export const getNameLocal = () => {
  const roleString = localStorage.getItem(LocalStorageConstants.KEYS.name);
  const userRole = JSON.parse(roleString);
  return userRole;
};
// export funtion to store user id in local storage
export const setUserIdLocal = (userId) => {
  localStorage.setItem(
    LocalStorageConstants.KEYS.userId,
    JSON.stringify(userId)
  );
};
// export funtion to store session id from local storage

export const setSesssionIdLocal = (id) => {
  localStorage.setItem(
    LocalStorageConstants.KEYS.sessionId,
    JSON.stringify(id)
  );
};
export const isLoggedInUserAdmin = () => {
  return getRoleLocal()
    ? getRoleLocal() ==
        LocalStorageConstants.ROLES.ADMIN
    : false;
};

export const isLoggedInUserGenerator = () => {
  //return true;
  return getRoleLocal()
    ? getRoleLocal() ==
        LocalStorageConstants.ROLES.GENERATOR_USER
    : false;
};

export const isLoggedInUserBillingSupervisor = () => {
  //return true;
  return getRoleLocal()
    ? getRoleLocal() ==
        LocalStorageConstants.ROLES.BILLING_SUPERVISOR
    : false;
};

export const isLoggedInUserOfficeUser = () => {
  //return true;
  return getRoleLocal()
    ? getRoleLocal() ==
        LocalStorageConstants.ROLES.OFFICE_USER
    : false;
};

export const isNormalRoute = (url) => {
  return url.toLowerCase().includes('/user/')
}
export const validateInputField = (newFieldValue, regex) => {
  // console.log(newFieldValue, regex)
  if (newFieldValue.match(regex)) {
    return true;
  }
  return false;
};
export const validate = (value, regex) => {
  return regex.test(value);
};
export const nameRegex = /^([a-zA-Z0-9]+\s?)*$/;
// export regex for description which allow special corrector
export const descriptionRegex =
  /^([a-zA-Z0-9\s\.\,\!\@\#\$\%\^\&\*\(\)\-\_\+\=\[\]\{\}\|\\\:\"\;\'\<\>\?\/\`\~\n\r]+)*$/;

  
  export const flushLocalstorage = () => {
    Object.keys(LocalStorageConstants.KEYS).map((key,i)=>{
      console.log(key); 
      if (localStorage.getItem(key)) {
        localStorage.removeItem(key)
      }
    });
  }
  export const getUserLocal = () => {
    const tokenString = localStorage.getItem(LocalStorageConstants.KEYS.userId);
    const userToken = JSON.parse(tokenString);
    return userToken;
  };
  export const GetErrorHandlingRoute = (e) => {
    var errorMessage = '';
    if(e.response && e.response.data && e.response.data.message){
      errorMessage = e.response.data.message
    }
    else if (e.response && e.response.data){
      try{
        JSON.parse(e.response.data)
        errorMessage = String(e.response.data)
      }
      catch(e){
        if (e.response){
          errorMessage = e.response.statusText
        }
        else{
          errorMessage = 'Unknown'
        }
      }
    }
    else if (e.response){
      errorMessage = e.response.statusText
    }
    else{
      errorMessage = 'unknown'
    }
    setErrorLocal({'ErrorCode': e.response ? e.response.status : 'unknown', 
    'ErrorMessage': errorMessage});
    if (
      e.response != null &&
      e.response != undefined &&
      e.response.status == HTTP_CONSTANTS.SESSION_TIMEOUT
    ) {
      console.log(e.response.status);
      return "/sessionexpired";
    } else {
      return "/error";
    }
  };

  export const setErrorLocal = (error) => {
    localStorage.setItem(LocalStorageConstants.KEYS.error, JSON.stringify(error));
  };
  export const getErrorLocal = () => {
    return JSON.parse(localStorage.getItem(LocalStorageConstants.KEYS.error));
  
  };

  export const HTTP_CONSTANTS = {
    SESSION_TIMEOUT: 401,
    SESSION_ROLE_ADMIN : 'datahub_admin',
    SESSION_ROLE_PARTICIPANT : 'datahub_participant'
}; 
export const   NO_SPACE_REGEX =  /^([^\s])*$/;
export const nameField= /^$|^[a-zA-Z0-9][a-zA-Z0-9. ]*$/;
