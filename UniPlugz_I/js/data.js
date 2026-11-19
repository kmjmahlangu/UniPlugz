

const API_KEY = "pub_48e70b51eae844ad870f6031453c012e";
const COUNTRY = "za"; 
const LANGUAGE = "en";
const CACHE_MINUTES = 30;
const TIMEOUT_MS = 12000;


const studentWords = /\b(students?|universit(y|ies)|varsity|campus(es)?|nsfas|bursar(y|ies)|tvet|matric|graduat\w*|tuition|learnerships?|internships?|scholarships?|undergraduate|postgraduate|lecturers?|higher education|dhet|student (housing|accommodation|residences?|debt|funding)|exam results|funza lushaka)\b/i;
const universityNames = /\b(SRC|Wits|UCT|UJ|UKZN|Unisa|UNISA|TUT|CPUT|DUT|VUT|UFS|NWU|UWC|NMU|UFH|Univen|UNIVEN|Stellenbosch|Rhodes)\b/;


const welcomeTopic = {
  id: "welcome",
  category: "education",
  terms: ["university", "students", "NSFAS", "bursary", "bursaries", "TVET", '"student accommodation"', '"matric results"', "learnership", '"university fees"']
};


 const deadlines = [
 
];






const topics = [
]


// Topic Dropdowns

document.querySelectorAll(".TopicToggle").forEach((button) => {

    button.addEventListener("click", function () {

        const Details = this.nextElementSibling;
        const IsExpanded = this.getAttribute("aria-expanded") === "true";

        this.setAttribute("aria-expanded", !IsExpanded);
        Details.hidden = IsExpanded;

    });

});
