// ===============================
// templates: Date Formatting Helpers
// ===============================

(function() {
  const globalScope = (typeof global !== 'undefined') ? global :
                      (typeof window !== 'undefined') ? window : this;
  const ctx = globalScope.__EXTENSION_SHARED__["templates"];

  const getCurrentDate = () => {
    const today = new Date();
    const months = ["January", "February", "March", "April", "May", "June",
                    "July", "August", "September", "October", "November", "December"];
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    return `${days[today.getDay()]}, ${months[today.getMonth()]} ${today.getDate()}, ${today.getFullYear()}`;
  };

  const getShortDate = () => {
    const today = new Date();
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    return `${months[today.getMonth()]} ${today.getDate()}, ${today.getFullYear()}`;
  };

  // Export helpers to shared namespace
  ctx.shared.DateFormatters = {
    getCurrentDate,
    getShortDate
  };
})();
