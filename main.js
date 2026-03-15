// Register Service Worker
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js")
    .then(() => console.log("Service Worker registered"))
    .catch(err => console.error("SW error:", err))
}

// Ask permission when button is clicked
document.getElementById("notifyBtn").addEventListener("click", async () => {
  const permission = await Notification.requestPermission()

  if (permission === "granted") {
    navigator.serviceWorker.ready.then(registration => {
      registration.showNotification("Hello!", {
        body: "This is a real system notification",
        icon: "icon.png"
      })
    })
  }
})
