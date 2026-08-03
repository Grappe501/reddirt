import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Shell } from "./Shell";
import { PresenterDrillPage, PresenterHub, PresenterSlidePage } from "./PresenterBoard";
import {
  Calendar,
  Campaign,
  Elections,
  Events,
  JoinHub,
  Local,
  SignupForm,
  Strategy,
  StrikeTeam,
  ThankYou,
  Vision,
  Welcome,
  Why,
  Youth,
} from "./pages";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Shell />}>
          <Route path="/" element={<Welcome />} />
          <Route path="/why" element={<Why />} />
          <Route path="/vision" element={<Vision />} />
          <Route path="/elections" element={<Elections />} />
          <Route path="/strategy" element={<Strategy />} />
          <Route path="/events" element={<Events />} />
          <Route path="/youth" element={<Youth />} />
          <Route path="/local" element={<Local />} />
          <Route path="/campaign" element={<Campaign />} />
          <Route path="/strike-team" element={<StrikeTeam />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/join" element={<JoinHub />} />
          <Route
            path="/join/local"
            element={
              <SignupForm
                pathway="local"
                title="Join My Local Team"
                intro="Tell us where you live and how you want to help organize locally."
              />
            }
          />
          <Route
            path="/join/campaign"
            element={
              <SignupForm
                pathway="campaign"
                title="Join a Statewide Campaign Team"
                intro="Choose the statewide team that fits — including Grassroots & Guitar Strings planning."
              />
            }
          />
          <Route
            path="/join/youth"
            element={
              <SignupForm
                pathway="youth"
                title="Arkansas Youth Coalition"
                intro="Join as ages 16–24, refer someone, or offer adult support."
              />
            }
          />
          <Route
            path="/join/match"
            element={
              <SignupForm
                pathway="match"
                title="Help Me Find My Place"
                intro="Share your interests and availability. We’ll help match you."
              />
            }
          />
          <Route path="/thank-you" element={<ThankYou />} />
          <Route path="/presenter" element={<PresenterHub />} />
          <Route path="/presenter/drill/:drillId" element={<PresenterDrillPage />} />
          <Route path="/presenter/:slideId" element={<PresenterSlidePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
