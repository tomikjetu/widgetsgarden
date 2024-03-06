export default function formatDate(date) {
  var hours = date.getHours();
  var minutes = date.getMinutes();
  minutes = minutes < 10 ? '0' + minutes : minutes;
  var seconds = date.getSeconds();
  seconds = seconds < 10 ? '0' + seconds : seconds;
  var strTime = hours + ':' + minutes + ':' + seconds;
  return date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear() + " " + strTime;
}
