setupHeader();
pageIntro();
initTopicToggles();
revealOnScroll(document.querySelectorAll(".TopicCard"), document.querySelector(".TopicsSection"));

// Topic Card Toggle

document.querySelectorAll(".TopicToggle").forEach(button => {

    button.addEventListener("click", () => {

        const card = button.closest(".TopicCard");
        const details = card.querySelector(".TopicDetails");
        const icon = button.querySelector("span");

        const isExpanded = button.getAttribute("aria-expanded") === "true";

        button.setAttribute("aria-expanded", !isExpanded);

        details.hidden = isExpanded;

        icon.textContent = isExpanded ? "＋" : "−";

    });

});