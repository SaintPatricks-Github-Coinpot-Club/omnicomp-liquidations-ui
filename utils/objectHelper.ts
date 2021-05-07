export const allObjKeyExists = (obj: any) => {
  for (const key in obj) {
    const element: any = obj[key];
    if (element == null || element == undefined) {
      return false;
    }
  }
  return true;
};
