// Given a list, return an array with just the username numbered
function NumberUsernames(list) {
  let numbered = []

  // If list is empty or null, return empty array
  if (list) {
    // Number usernames
    for (var i = 0; i < list.length; i++) {
      let temp = `${i + 1}. ${list[i].username}`;
      numbered.push(`<li class="py-2 list-group-item">${temp}</li>`);
    }
  }

  return numbered;
}

module.exports = {
  NumberUsernames: NumberUsernames
}