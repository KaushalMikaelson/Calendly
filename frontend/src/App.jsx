import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import { ToastProvider } from './components/ui/Toast';
import Dashboard from './pages/Dashboard';
import EventTypeForm from './pages/EventTypeForm';
import Availability from './pages/Availability';
import Meetings from './pages/Meetings';
import BookingPage from './pages/BookingPage';
import Confirmation from './pages/Confirmation';
import LandingPage from './pages/LandingPage';
import CancelPage from './pages/CancelPage';
import ReschedulePage from './pages/ReschedulePage';

function App() {
  return (
    <ToastProvider>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route
          path="/dashboard"
          element={(
            <Layout>
              <Dashboard />
            </Layout>
          )}
        />
        <Route
          path="/event-types/new"
          element={(
            <Layout>
              <EventTypeForm />
            </Layout>
          )}
        />
        <Route
          path="/event-types/:id/edit"
          element={(
            <Layout>
              <EventTypeForm />
            </Layout>
          )}
        />
        <Route
          path="/availability"
          element={(
            <Layout>
              <Availability />
            </Layout>
          )}
        />
        <Route
          path="/meetings"
          element={(
            <Layout>
              <Meetings />
            </Layout>
          )}
        />
        <Route path="/book/:slug" element={<BookingPage />} />
        <Route path="/confirmation" element={<Confirmation />} />
        <Route path="/cancel/:token" element={<CancelPage />} />
        <Route path="/reschedule/:token" element={<ReschedulePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ToastProvider>
  );
}

export default App;

