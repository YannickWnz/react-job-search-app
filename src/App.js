import React, { useState, useEffect, useCallback } from "react";
import moment from "moment";
import "./App.scss";

function App() {
const [titleSearch, setTitleSearch] = useState("");
const [errorMsg, setErrorMsg] = useState(false);
const [data, setData] = useState([]);
const [formState, setFormState] = useState(false);
const [isLoading, setIsLoading] = useState(false);
const [jobNo, setJobNo] = useState(6);
const [jobLoading, setJobLoading] = useState(false);
const [errorFetching, setErrorFetching] = useState("");
const [descriptionState, setDescriptionState] = useState(false);
const [jobDescriptions, setJobDescritions] = useState(null);
const [url, setUrl] = useState("https://remotive.com/api/remote-jobs");

// function to run on form submit
const handleSearchSubmit = (e) => {
e.preventDefault();

// display error message if empty input
if (titleSearch.length == 0) {
    setErrorMsg(true);
    return;
}

// remove empty space from user input
let trimInput = titleSearch.trim();
let search = trimInput.replace(/\s/g, "%20");

setFormState(true);

// update titleSearch state with user input
setTitleSearch(search);

// update url state with user input
setUrl(`https://remotive.com/api/remote-jobs?search=${search}`);

setIsLoading(true)
resetForm();
};

// function loading more jobs to display
const handleSetJobNo = () => {
setJobLoading(true);
const timer = setTimeout(() => {
    setJobNo((prev) => prev + 6);
    setJobLoading(false);
}, 1000);
return () => clearTimeout(timer);
};

// function sending api request to fetch jobs data
useEffect(() => {
const fetchData = async () => {
    try {
    if (formState) {
        const res = await fetch(url);
        const json = await res.json();
        setData(json.jobs);
        setIsLoading(false);

        // update fetching error state if no data was received
        if (data.length === 0) {
        setErrorFetching("Couldn't get the job you are searching. Please try again");
        }
    }
    } catch (err) {
    setIsLoading(false);
    console.log(err);
    }
};

fetchData(url);
}, [url, jobNo]);

const resetForm = () => {
setTitleSearch("");
};

// function formatting date format received from api data 
const convertJobPublicationTime = (str) => {
let publicationDate = moment(str).format("MMM Do YYYY");
return publicationDate;
};

// function formating job type received from api data 
const handleUnderscoreReplacement = (str) => {
let input = str.charAt(0).toUpperCase() + str.slice(1);
let jobType = input.replace("_", " ");
return jobType;
};

// function handling the storing of selected job by user in an array
const handleJobDescription = (index, id) => {
const jobDescription = {
    url: data[index].url,
    logo: data[index].company_logo,
    companyName: data[index].company_name,
    description: data[index].description,
    title: data[index].title,
    location: data[index].candidate_required_location,
    id: data[index].id,
    jobPublicationDate: data[index].publication_date,
    jobType: data[index].job_type,
    show: true,
};

setJobDescritions(jobDescription);
};

const handleDescriptionToggling = () => {
setDescriptionState(true);
};

// html to text formatting function
const handleHtmlToText = (html) => {
let strippedHtml = html.replace(/<[^>]+>/g, "");

return strippedHtml;
};

return (
<div className="App">
    <div className="search-section">
    <div className="search-section-container">
        <div className="logo-section">
        <p>rcajobs</p>
        <div className="site-mode"></div>
        </div>
        <div className="search-form-container">
        <form id="search-form" onSubmit={handleSearchSubmit}>
            <div className="title-search">
            <i className="fa-solid fa-magnifying-glass"></i>
            <input
                type="text"
                name="title"
                placeholder="Search by title, role, expertise..."
                onChange={(e) => {
                setTitleSearch(e.target.value);
                setErrorMsg(false);
                }}
                value={titleSearch}
            />
            </div>
            <div className="submit-btn-wrapper">
            <input type="submit" value="Search" />
            </div>
        </form>
        {errorMsg && (
            <p className="search-form-error-msg">Can't be empty</p>
        )}
        </div>
    </div>
    </div>

    {/* job section start */}
    <div className="jobs-section">
    <div className="jobs-section-container">
        {isLoading && (
        <div className="loader">
            <div className="loader-wrapper">
            <span className="loader"></span>
            </div>
        </div>
        )}
        {!isLoading && errorFetching && data.length === 0 && (
        <div className="error-fetching-job">
            <h2 style={{ color: "white", textAlign: "center" }}>
            Could not get the job you are searching. Please try again
            </h2>
        </div>
        )}
        {!isLoading && (
        <div className="jobs-wrapper">
            {data?.slice(0, jobNo).map((job, index) => {
            return (
                <div
                key={job.id}
                onClick={() => {
                    handleJobDescription(index, job.id);
                    handleDescriptionToggling();
                }}
                className="job"
                >
                <div className="company-logo">
                    <img src={job.company_logo} />
                </div>
                <div className="job-posting-time">
                    <p>
                    Posted on{" "}
                    {convertJobPublicationTime(job.publication_date)}
                    </p>
                    <span></span>
                    <p>{handleUnderscoreReplacement(job.job_type)}</p>
                </div>
                <p className="job-title">{job.title}</p>
                <p className="company-name">{job.company_name}</p>
                <p className="country">{job.candidate_required_location}</p>
                </div>
            );
            })}
        </div>
        )}
        {!isLoading && data.length > 0 && jobNo < data.length && (
        <div className="load-more-btn-wrapper">
            <button onClick={handleSetJobNo}>
            {jobLoading ? "Loading..." : "Load More"}
            </button>
        </div>
        )}
    </div>
    </div>

    {jobDescriptions && (
    <div
        className={`job-description-section ${
        descriptionState ? "" : "hide-description"
        }`}
    >
        <i
        className="fa-solid fa-xmark"
        onClick={() => setDescriptionState(false)}
        ></i>
        <div className="job-section-container">
        <div className="company-details">
            <div className="logo">
            <img src={jobDescriptions.logo} />
            </div>
            <div className="details">
            <div className="name">
                <p>{jobDescriptions.companyName}</p>
            </div>
            </div>
        </div>
        <div className="job-details">
            <div className="job-title-container">
            <div className="job-title">
                <p>
                {convertJobPublicationTime(jobDescriptions.jobPublicationDate)}
                {" "}
                <span>.</span>
                {" "}
                {handleUnderscoreReplacement(jobDescriptions.jobType)}
                </p>
                <h1>{jobDescriptions.title}</h1>
                <p>{jobDescriptions.location}</p>
            </div>
            <div className="apply-btn-wrapper">
                <a href={jobDescriptions.url} target="_blank">
                Apply Now
                </a>
            </div>
            </div>
            <div className="job-text-details">
            <h2>Job description</h2>
            <p>{handleHtmlToText(jobDescriptions.description)}</p>
            </div>
        </div>
        </div>
    </div>
    )}
</div>
);
}

export default App;
