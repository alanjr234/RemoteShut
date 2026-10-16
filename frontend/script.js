
const shutdownBtn = document.getElementById("shutdownBtn");

shutdownBtn.addEventListener("click", () => {
    const confirmed = window.confirm(
        "Are you sure you want to shut down your laptop?"
    );

    if (confirmed) {
        alert(
            "Interface ready. Remote shutdown is not connected yet."
        );
    }
});
