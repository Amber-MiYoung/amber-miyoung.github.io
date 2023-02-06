// use fetch to retrieve the project and pass them to init
// report any errors that occur in the fetch operation
// once the products have been successfully loaded and formatted as a JSON object
// using response.json(), run the initialize() function
fetch('./data/projects.json')
  .then((response) => {
    if (!response.ok) {
      throw new Error(`HTTP error occured!!: ${response.status}`);
    }
    return response.json();
  })
  .then((json) => initialize(json))
  .catch((err) => console.error(`Fetch problem: ${err.message}`));

// sets up the app logic, declares required variables, contains all the other functions
function initialize(projects) {

  console.log("Amber, Entering initialize(porjects) function....");

  // grab the UI elements that we need to manipulate
  const category = document.querySelector('#category');
  const searchTerm = document.querySelector('#searchTerm');
  const searchBtn = document.querySelector('button');
  const main = document.querySelector('main');

  console.log("Amber, Grabbed the UP elements handles.. ");

  // keep a record of what the last category and search term entered were
  let lastCategory = category.value;
  // no search has been made yet
  let lastSearch = '';

  console.log("Amber, lastSearch value is: ", lastSearch);

  // these contain the results of filtering by category, and search term
  // finalGroup will contain the projects that need to be displayed after
  // the searching has been done. Each will be an array containing objects.
  // Each object will represent a project
  let categoryGroup;
  let finalGroup;

  // To start with, set finalGroup to equal the entire projects database
  // then run updateDisplay(), so ALL projects are displayed initially.
  finalGroup = projects;

  console.log("Amber, showing what's in finalGroup now: ", finalGroup);
  updateDisplay();

  // Set both to equal an empty array, in time for searches to be run
  categoryGroup = [];
  finalGroup = [];

  // when the search button is clicked, invoke selectCategory() to start
  // a search running to select the category of projects we want to display
  searchBtn.addEventListener('click', selectCategory);

  function selectCategory(e) {
    // Use preventDefault() to stop the form submitting — that would ruin
    // the experience
    e.preventDefault();

    // Set these back to empty arrays, to clear out the previous search
    categoryGroup = [];
    finalGroup = [];

    // if the category and search term are the same as they were the last time a
    // search was run, the results will be the same, so there is no point running
    // it again — just return out of the function
    if (category.value === lastCategory && searchTerm.value.trim() === lastSearch) {
      return;
    } else {
      // update the record of last category and search term
      lastCategory = category.value;
      lastSearch = searchTerm.value.trim();
      // In this case we want to select all projects, then filter them by the search
      // term, so we just set categoryGroup to the entire JSON object, then run selectProjects()
      if (category.value === 'All') {
        categoryGroup = projects;
        selectProjects();
        // If a specific category is chosen, we need to filter out the projects not in that
        // category, then put the remaining projects inside categoryGroup, before running
        // selectProjects()
      } else {
        // the values in the <option> elements are uppercase, whereas the categories
        // store in the JSON (under "type") are lowercase. We therefore need to convert
        // to lower case before we do a comparison
        const lowerCaseType = category.value.toLowerCase();
        // Filter categoryGroup to contain only projects whose type includes the category
        categoryGroup = projects.filter(project => project.type === lowerCaseType);

        // Run selectProjects() after the filtering has been done
        selectProjects();
      }
    }
  }

  // selectProjects() Takes the group of projects selected by selectCategory(), and further
  // filters them by the tiered search term (if one has been entered)
  function selectProjects() {
    // If no search term has been entered, just make the finalGroup array equal to the categoryGroup
    // array — we don't want to filter the projects further.
    if (searchTerm.value.trim() === '') {
      finalGroup = categoryGroup;
    } else {
      // Make sure the search term is converted to lower case before comparison. We've kept the
      // project names all lower case to keep things simple
      const lowerCaseSearchTerm = searchTerm.value.trim().toLowerCase();
      // Filter finalGroup to contain only projects whose name includes the search term
      // finalGroup = categoryGroup.filter(project => project.name.includes(lowerCaseSearchTerm));
      finalGroup = categoryGroup.filter(project => project.type.includes(lowerCaseSearchTerm));
    }
    // Once we have the final group, update the display
    updateDisplay();
  }

  // start the process of updating the display with the new set of project
  function updateDisplay() {
    // remove the previous contents of the <main> element
    while (main.firstChild) {
      main.removeChild(main.firstChild);
    }

    // if no projects match the search term, display a "No results to display" message
    if (finalGroup.length === 0) {
      const para = document.createElement('p');
      para.textContent = 'No results to display!';
      main.appendChild(para);
      // for each project we want to display, pass its project object to fetchBlob()
    } else {
      for (const project of finalGroup) {
        // fetchBlob(project);  // not required to fetch the blob data for this project display
        console.log("Amber, showing current project from finalGroup: ", project);
        showProject(project);
      }
    }
  }

  // fetchBlob uses fetch to retrieve the image for that project, and then sends the
  // resulting image display URL and project object on to showProject() to finally
  // display it
  function fetchBlob(project) {
    // construct the URL path to the image file from the project.image property
    const url = `./images/${project.image}`;
    // Use fetch to fetch the image, and convert the resulting response to a blob
    // Again, if any errors occur we report them in the console.
    fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error occured!: ${response.status}`);
        }
        return response.blob();
      })
      .then((blob) => showProject(blob, project))
      .catch((err) => console.error(`Fetch problem: ${err.message}`));

  }

  // Display a project inside the <main> element
  // function showProject(blob, project) {  // just need project object only for this. no need of image blob data.
  function showProject(project) {
    // Convert the blob to an object URL — this is basically an temporary internal URL
    // that points to an object stored inside the browser
    // const objectURL = URL.createObjectURL(blob);
    // create <section>, <h2>, <p>, and <img> elements
    const section = document.createElement('section');
    const heading = document.createElement('h2');
    const para = document.createElement('p');
    // const image = document.createElement('img');
    const a = document.createElement('a'); // added, to hold the repository link information.
    console.log("Amber, showing the grabbed UI element..", section, heading, para, a);

    // give the <section> a classname equal to the project "type" property so it will display the correct icon
    section.setAttribute('class', project.type);

    // Give the <h2> textContent equal to the project "name" property, but with the first character
    // replaced with the uppercase version of the first character
    heading.textContent = project.name.replace(project.name.charAt(0), project.name.charAt(0).toUpperCase());

    // Give the <p> textContent equal to the project "description" property, with a $ sign in front
    // toFixed(2) is used to fix the price at 2 decimal places, so for example 1.40 is displayed
    // as 1.40, not 1.4.
    // para.textContent = `$${project.price.toFixed(2)}`;
    para.textContent = project.description;

    // Set the src of the <img> element to the ObjectURL, and the alt to the project "name" property
    // image.src = objectURL;
    // image.alt = project.name;

    // Set the src of the <a> element to repository link provided 
    a.href = project.repository_link;
    a.innerText = project.repository_link;

    // append the elements to the DOM as appropriate, to add the product to the UI
    main.appendChild(section);
    section.appendChild(heading);
    section.appendChild(para);
    // section.appendChild(image);
    section.appendChild(a);
  }
}