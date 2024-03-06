function updateTimeAnalog(element, date) {
  const hours = ((date.getHours() + 11) % 12) + 1;
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();

  const hour = hours * 30;
  const minute = minutes * 6;
  const second = seconds * 6;

  element.querySelector(".hour").style.rotate = `${hour}deg`;
  element.querySelector(".minute").style.rotate = `${minute}deg`;
  element.querySelector(".second").style.rotate = `${second}deg`;
}