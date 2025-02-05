async function getDate(timestamp) {
  try {
    const date = new Date(timestamp * 1000);
    let day = date.getDate();
    let month = date.getMonth() + 1;
    const year = date.getFullYear();

    if (day < 10) {
      day = `0${day}`;
    }

    if (month < 10) {
      month = `0${month}`;
    }
    
    return `${day}/${month}/${year}`;
  } catch (error) {
    return { error: error.message };
  }
}

export { getDate };
