let saved: String[];

module.exports = (temp: string[]) => {
  if (saved == undefined) {
    saved = [...temp];
    return false;
  } else {
    if (
      temp.length === saved.length &&
      temp.every((value, index) => value === saved[index])
    ) {
      return true;
    } else {
      return false;
    }
  }
};
// RETURN TRUE IF NO CHANGES IN DATA
// RETURN FALSE ON FIRST RUN AND WHEN THE ARE CHANGES IN DATA
