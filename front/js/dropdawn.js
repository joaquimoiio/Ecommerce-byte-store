document.addEventListener("DOMContentLoaded", function () {
    const profileMenuToggle = document.getElementById("profileMenuToggle");
    const profileMenu = document.getElementById("profileMenu");

    profileMenuToggle.addEventListener("click", function (event) {
        event.preventDefault();
        profileMenu.style.display = profileMenu.style.display === "block" ? "none" : "block";
    });

    document.addEventListener("click", function (event) {
        if (!profileMenuToggle.contains(event.target) && !profileMenu.contains(event.target)) {
            profileMenu.style.display = "none";
        }
    });
});
