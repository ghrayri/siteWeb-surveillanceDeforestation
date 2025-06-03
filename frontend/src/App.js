import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";

// Components
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

// Pages
import Home from "./pages/Home";
import RegionList from "./pages/RegionList";
import RegionDetail from "./pages/RegionDetail";
import PointList from "./pages/PointList";
import PointDetail from "./pages/PointDetail";
import DataLayerList from "./pages/DataLayerList";
import DataLayerDetail from "./pages/DataLayerDetail";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Activate from "./pages/Activate";
import Profile from "./pages/Profile";
import DeforestationAnalysisPage from "./pages/DeforestationAnalysisPage";
import SatelliteImagesPage from "./pages/SatelliteImagesPage";
import EODataList from "./pages/EODataList";
import EODataDetail from "./pages/EODataDetail";
import IoTDataList from "./pages/IoTDataList";
import IoTDataDetail from "./pages/IoTDataDetail";
import RealTimeList from "./pages/RealTimeList";
import RealTimeDetail from "./pages/RealTimeDetail";
import RealTimeSatelliteData from "./pages/RealTimeSatelliteData";
import UserZonesPage from "./pages/UserZonesPage";
import IndexAnalysisList from "./pages/IndexAnalysisList";
import IndexAnalysisDetail from "./pages/IndexAnalysisDetail";
import DataDashboard from "./pages/DataDashboard";

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <main className="container py-4">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/regions" element={<RegionList />} />
            <Route path="/regions/:id" element={<RegionDetail />} />
            <Route
              path="/regions/:id/deforestation"
              element={<DeforestationAnalysisPage />}
            />
            <Route
              path="/regions/:id/satellite-images"
              element={<SatelliteImagesPage />}
            />
            <Route path="/points" element={<PointList />} />
            <Route path="/points/:id" element={<PointDetail />} />
            <Route path="/layers" element={<DataLayerList />} />
            <Route path="/layers/:id" element={<DataLayerDetail />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/activate" element={<Activate />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/eodata" element={<EODataList />} />
            <Route path="/eodata/:id" element={<EODataDetail />} />
            <Route path="/iot" element={<IoTDataList />} />
            <Route path="/iot/:id" element={<IoTDataDetail />} />
            <Route path="/realtime" element={<RealTimeList />} />
            <Route path="/realtime/:id" element={<RealTimeDetail />} />
            <Route
              path="/realtime-satellite"
              element={<RealTimeSatelliteData />}
            />
            <Route path="/user-zones" element={<UserZonesPage />} />
            <Route path="/index-analysis" element={<IndexAnalysisList />} />
            <Route
              path="/index-analysis/:id"
              element={<IndexAnalysisDetail />}
            />
            <Route path="/dashboard" element={<DataDashboard />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
