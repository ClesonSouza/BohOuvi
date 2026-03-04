import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import FormDownload from "../elements/formDownload/formDownload";
import ProgressBox from "../elements/progressBox/progressBox";

function Downloads() {
  const navigate = useNavigate();

  const [downloadStarted, setDownloadStarted] = useState(() => {
    return sessionStorage.getItem("downloadSession") === "true";
  });

  return (
    <div className="main">
      <h1>Downloads</h1>

      <button className="voltar" onClick={() => navigate("/")}>
        <FaArrowLeft />
      </button>

      {!downloadStarted && (
        <FormDownload onSetDownloadStarted={setDownloadStarted} />
      )}

      {downloadStarted && (
        <ProgressBox onSetDownloadStarted={setDownloadStarted} />
      )}
    </div>
  );
}

export default Downloads;