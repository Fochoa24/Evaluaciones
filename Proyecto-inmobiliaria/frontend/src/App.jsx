import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import ConsentBanner from './components/ConsentBanner';
import Footer from './components/Footer';
import Header from './components/Header';
import ProtectedRoute from './components/ProtectedRoute';
import ScrollToTop from './components/ScrollToTop';
import { ArriendosProvider } from './context/ArriendosContext';
import { AuthProvider } from './context/AuthContext';
import { PropiedadesProvider } from './context/PropiedadesContext';
import { VisitasProvider } from './context/VisitasContext';
import { ROLES_CLIENTE, ROLES_GESTION, ROLES_INTERNOS } from './data/roles';
import ArriendoNuevo from './pages/ArriendoNuevo';
import Arriendos from './pages/Arriendos';
import Clientes from './pages/Clientes';
import Cuenta from './pages/Cuenta';
import PoliticaCookies from './pages/PoliticaCookies';
import Dashboard from './pages/Dashboard';
import DetallePropiedad from './pages/DetallePropiedad';
import Home from './pages/Home';
import Login from './pages/Login';
import Privacidad from './pages/Privacidad';
import Propiedades from './pages/Propiedades';
import PropiedadEditar from './pages/PropiedadEditar';
import PropiedadNueva from './pages/PropiedadNueva';
import Registro from './pages/Registro';
import Terminos from './pages/Terminos';
import Usuarios from './pages/Usuarios';
import Verificar from './pages/Verificar';
import Visitas from './pages/Visitas';

export default function App() {
    return (
        <BrowserRouter>
            <ScrollToTop />
            <AuthProvider>
                <PropiedadesProvider>
                    <VisitasProvider>
                        <ArriendosProvider>
                            <div className="body">
                                <a className="skip-link" href="#contenido-principal">
                                    Saltar al contenido principal
                                </a>
                                <Header />
                                <div
                                    id="contenido-principal"
                                    tabIndex={-1}
                                    className="contenido-principal"
                                >
                                    <Routes>
                                        <Route path="/" element={<Home />} />
                                        <Route path="/propiedades" element={<Propiedades />} />
                                        <Route
                                            path="/propiedades/nueva"
                                            element={
                                                <ProtectedRoute roles={ROLES_GESTION}>
                                                    <PropiedadNueva />
                                                </ProtectedRoute>
                                            }
                                        />
                                        <Route
                                            path="/propiedades/:id"
                                            element={<DetallePropiedad />}
                                        />
                                        <Route
                                            path="/propiedades/:id/editar"
                                            element={
                                                <ProtectedRoute roles={ROLES_GESTION}>
                                                    <PropiedadEditar />
                                                </ProtectedRoute>
                                            }
                                        />
                                        <Route path="/login" element={<Login />} />
                                        <Route path="/registro" element={<Registro />} />
                                        <Route path="/verificar/:token" element={<Verificar />} />
                                        <Route path="/privacidad" element={<Privacidad />} />
                                        <Route path="/terminos" element={<Terminos />} />
                                        <Route path="/cookies" element={<PoliticaCookies />} />
                                        <Route
                                            path="/dashboard"
                                            element={
                                                <ProtectedRoute>
                                                    <Dashboard />
                                                </ProtectedRoute>
                                            }
                                        />
                                        <Route
                                            path="/visitas"
                                            element={
                                                <ProtectedRoute>
                                                    <Visitas />
                                                </ProtectedRoute>
                                            }
                                        />
                                        <Route
                                            path="/arriendos"
                                            element={
                                                <ProtectedRoute>
                                                    <Arriendos />
                                                </ProtectedRoute>
                                            }
                                        />
                                        <Route
                                            path="/arriendos/nueva"
                                            element={
                                                <ProtectedRoute roles={ROLES_CLIENTE}>
                                                    <ArriendoNuevo />
                                                </ProtectedRoute>
                                            }
                                        />
                                        <Route
                                            path="/arriendos/nueva/:id"
                                            element={
                                                <ProtectedRoute roles={ROLES_CLIENTE}>
                                                    <ArriendoNuevo />
                                                </ProtectedRoute>
                                            }
                                        />
                                        <Route
                                            path="/usuarios"
                                            element={
                                                <ProtectedRoute roles={ROLES_INTERNOS}>
                                                    <Usuarios />
                                                </ProtectedRoute>
                                            }
                                        />
                                        {/* Enlace antiguo: los propietarios son usuarios (D1). */}
                                        <Route
                                            path="/propietarios"
                                            element={<Navigate to="/usuarios?rol=propietario" replace />}
                                        />
                                        <Route
                                            path="/cuenta"
                                            element={
                                                <ProtectedRoute cualquierEstado>
                                                    <Cuenta />
                                                </ProtectedRoute>
                                            }
                                        />
                                        <Route
                                            path="/clientes"
                                            element={
                                                <ProtectedRoute roles={ROLES_INTERNOS}>
                                                    <Clientes />
                                                </ProtectedRoute>
                                            }
                                        />
                                    </Routes>
                                </div>
                                <Footer />
                                <ConsentBanner />
                            </div>
                        </ArriendosProvider>
                    </VisitasProvider>
                </PropiedadesProvider>
            </AuthProvider>
        </BrowserRouter>
    );
}
