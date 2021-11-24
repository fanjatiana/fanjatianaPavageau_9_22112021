/*export const formatDate = (dateStr) => {
  const date = new Date(dateStr)
  const ye = new Intl.DateTimeFormat('fr', { year: 'numeric' }).format(date)
  const mo = new Intl.DateTimeFormat('fr', { month: 'short' }).format(date)
  const da = new Intl.DateTimeFormat('fr', { day: '2-digit' }).format(date)
  const month = mo.charAt(0).toUpperCase() + mo.slice(1)
  return `${ye.toString().substr(2,4)} ${month.substr(0,3)} ${parseInt(da)}. `
}*/

// modification de la fonction formatDate : AAA/MM/JJ
export const formatDate = (dateStr) => {
  let date = new Date(dateStr)
  date = date.getFullYear()+ "/" + (date.getMonth() + 1) + "/" + date.getDate();
  const dateIsValid = /^(19|20)\d\d[- ./](0?[1-9]|1[012])[- ./](0?[1-9]|[12][0-9]|3[01])$/
  if (!dateIsValid.test(date)){
    return dateStr = "2000/01/01"
  }
  return date
}
 
export const formatStatus = (status) => {
  switch (status) {
    case "pending":
      return "En attente"
    case "accepted":
      return "Accepté"
    case "refused":
      return "Refused"
  }
}