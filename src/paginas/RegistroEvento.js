"use client"

import { useEffect, useState, useCallback } from "react"
import axios from "axios"
import LogoutButton from "../components/LogoutButton"
import "./RegistroEvento.css"

function RegistroEvento() {
  const [eventos, setEventos] = useState([])
  const [nombreEvento, setNombreEvento] = useState("")
  const [descripcion, setDescripcion] = useState("")
  const [ubicacion, setUbicacion] = useState("")
  const [fechaHora, setFechaHora] = useState("")
  const [editId, setEditId] = useState(null)
  const [viewMode, setViewMode] = useState("list") // "list" or "calendar"
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [showEventForm, setShowEventForm] = useState(false)
  const [selectedDate, setSelectedDate] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [notification, setNotification] = useState({ show: false, message: "", type: "" })

  const user = JSON.parse(localStorage.getItem("user"))
  const isAdmin = user?.rol === "admin"

  // Usar useCallback para evitar recrear la función en cada renderizado
  const fetchEventos = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await axios.get("http://localhost/eventosC/RegistroEvento.php")
      setEventos(response.data)
    } catch (error) {
      console.error("Error al obtener los eventos:", error)
      showNotification("Error al cargar los eventos", "error")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchEventos()

    // Animation effect for background
    const interval = setInterval(() => {
      const root = document.documentElement
      const hue = Math.floor(Math.random() * 40) + 220 // Blue-purple range
      root.style.setProperty("--gradient-hue", `${hue}`)
    }, 3000)

    return () => clearInterval(interval)
  }, [fetchEventos])

  const showNotification = (message, type) => {
    setNotification({ show: true, message, type })
    setTimeout(() => {
      setNotification({ show: false, message: "", type: "" })
    }, 3000)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    const eventoData = {
      nombre_evento: nombreEvento,
      descripcion,
      ubicacion,
      fecha_hora: fechaHora,
      usuario_id: user.id,
    }

    try {
      if (editId) {
        await axios.put("http://localhost/eventosC/RegistroEvento.php", {
          ...eventoData,
          id: editId,
        })
        showNotification("Evento actualizado con éxito", "success")
      } else {
        const response = await axios.post("http://localhost/eventosC/RegistroEvento.php", eventoData)

        // Verificar si la respuesta fue exitosa
        if (response.data && response.status === 200) {
          showNotification("Evento agregado con éxito", "success")

          // Marcar la fecha seleccionada en el calendario
          if (fechaHora) {
            setSelectedDate(new Date(fechaHora))
          }

          // Actualizar la lista de eventos inmediatamente
          await fetchEventos()
        } else {
          showNotification("Error al guardar el evento", "error")
        }
      }

      resetForm()
    } catch (error) {
      console.error("Error al guardar el evento:", error)
      showNotification("Error al guardar el evento", "error")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este evento?")) {
      setIsLoading(true)
      try {
        await axios.delete(`http://localhost/eventosC/RegistroEvento.php?id=${id}`)
        await fetchEventos() // Asegurarse de que se actualice la lista después de eliminar
        showNotification("Evento eliminado con éxito", "success")
      } catch (error) {
        console.error("Error al eliminar el evento:", error)
        showNotification("Error al eliminar el evento", "error")
      } finally {
        setIsLoading(false)
      }
    }
  }

  const resetForm = () => {
    setNombreEvento("")
    setDescripcion("")
    setUbicacion("")
    setFechaHora("")
    setEditId(null)
    setShowEventForm(false)
  }

  const handleEditClick = (evento) => {
    setEditId(evento.id)
    setNombreEvento(evento.nombre_evento)
    setDescripcion(evento.descripcion)
    setUbicacion(evento.ubicacion)
    setFechaHora(evento.fecha_hora)
    setShowEventForm(true)
  }

  const handleAddEventClick = (date = null) => {
    resetForm()
    if (date) {
      const formattedDate = formatDateForInput(date)
      setFechaHora(formattedDate)
      setSelectedDate(date)
    }
    setShowEventForm(true)
  }

  const formatDateForInput = (date) => {
    const d = new Date(date)
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, "0")
    const day = String(d.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}T00:00`
  }

  // Calendar functions
  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 0, 0).getDate()
  }

  const getFirstDayOfMonth = (year, month) => {
    // Ajustamos para que el primer día de la semana sea domingo (0) en lugar de lunes
    return new Date(year, month, 1).getDay()
  }

  const renderCalendar = () => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const daysInMonth = getDaysInMonth(year, month)
    const firstDayOfMonth = getFirstDayOfMonth(year, month)

    const monthNames = [
      "Enero",
      "Febrero",
      "Marzo",
      "Abril",
      "Mayo",
      "Junio",
      "Julio",
      "Agosto",
      "Septiembre",
      "Octubre",
      "Noviembre",
      "Diciembre",
    ]

    const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]

    // Create calendar grid
    const calendarDays = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      calendarDays.push(<div key={`empty-${i}`} className="calendar-day empty"></div>)
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)

      // Find events for this day
      const dayEvents = eventos.filter((evento) => {
        const eventDate = new Date(evento.fecha_hora)
        return eventDate.getDate() === day && eventDate.getMonth() === month && eventDate.getFullYear() === year
      })

      calendarDays.push(
        <div
          key={`day-${day}`}
          className={`calendar-day ${dayEvents.length > 0 ? "has-events" : ""} ${
            selectedDate &&
            selectedDate.getDate() === day &&
            selectedDate.getMonth() === month &&
            selectedDate.getFullYear() === year
              ? "selected-day"
              : ""
          }`}
          onClick={() => isAdmin && handleAddEventClick(date)}
        >
          <div className="day-number">{day}</div>
          {dayEvents.length > 0 && (
            <div className="day-events">
              {dayEvents.map((evento, index) => (
                <div
                  key={`event-${evento.id}`}
                  className="calendar-event"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleEventClick(evento)
                  }}
                >
                  {evento.nombre_evento}
                </div>
              ))}
              {dayEvents.length > 2 && <div className="more-events">+{dayEvents.length - 2} más</div>}
            </div>
          )}
        </div>,
      )
    }

    return (
      <div className="calendar-container">
        <div className="calendar-header">
          <button className="calendar-nav-btn" onClick={() => setCurrentMonth(new Date(year, month - 1))}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>
          <h2>
            {monthNames[month]} {year}
          </h2>
          <button className="calendar-nav-btn" onClick={() => setCurrentMonth(new Date(year, month + 1))}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        </div>
        <div className="calendar-days-header">
          {dayNames.map((day) => (
            <div key={day} className="day-name">
              {day}
            </div>
          ))}
        </div>
        <div className="calendar-grid">{calendarDays}</div>
      </div>
    )
  }

  const handleEventClick = (evento) => {
    // Mostrar detalles del evento y marcar la fecha
    setSelectedEvent(evento)
    setSelectedDate(new Date(evento.fecha_hora))
  }

  const [selectedEvent, setSelectedEvent] = useState(null)

  return (
    <div className="evento-container">
      <div className="evento-background">
        <div className="shape shape1"></div>
        <div className="shape shape2"></div>
        <div className="shape shape3"></div>
      </div>

      <div className="evento-card">
        <div className="evento-header">
          <div className="logo-container">
            <div className="logo-circle"></div>
            <div className="logo-text">EventosC</div>
          </div>
          <h2>Gestión de Eventos</h2>
          <div className="header-actions">
            <div className="view-toggle">
              <button className={`view-btn ${viewMode === "list" ? "active" : ""}`} onClick={() => setViewMode("list")}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="8" y1="6" x2="21" y2="6"></line>
                  <line x1="8" y1="12" x2="21" y2="12"></line>
                  <line x1="8" y1="18" x2="21" y2="18"></line>
                  <line x1="3" y1="6" x2="3.01" y2="6"></line>
                  <line x1="3" y1="12" x2="3.01" y2="12"></line>
                  <line x1="3" y1="18" x2="3.01" y2="18"></line>
                </svg>
                Lista
              </button>
              <button
                className={`view-btn ${viewMode === "calendar" ? "active" : ""}`}
                onClick={() => setViewMode("calendar")}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
                Calendario
              </button>
            </div>
            <LogoutButton />
          </div>
        </div>

        {notification.show && (
          <div className={`notification ${notification.type}`}>
            {notification.type === "success" ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            )}
            <span>{notification.message}</span>
          </div>
        )}

        {isAdmin && !showEventForm && (
          <div className="add-event-container">
            <button className="add-event-btn" onClick={() => handleAddEventClick()}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="16"></line>
                <line x1="8" y1="12" x2="16" y2="12"></line>
              </svg>
              Nuevo Evento
            </button>
          </div>
        )}

        {showEventForm && (
          <div className="event-form-container">
            <h3>{editId ? "Editar Evento" : "Nuevo Evento"}</h3>
            <form onSubmit={handleSubmit} className="event-form">
              <div className="form-group">
                <label htmlFor="nombreEvento">Nombre del Evento</label>
                <input
                  id="nombreEvento"
                  type="text"
                  value={nombreEvento}
                  onChange={(e) => setNombreEvento(e.target.value)}
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="descripcion">Descripción</label>
                <textarea
                  id="descripcion"
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  required
                  className="form-input"
                  rows="4"
                />
              </div>

              <div className="form-group">
                <label htmlFor="fechaHora">Fecha y Hora</label>
                <input
                  id="fechaHora"
                  type="datetime-local"
                  value={fechaHora}
                  onChange={(e) => setFechaHora(e.target.value)}
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="ubicacion">Ubicación (opcional)</label>
                <input
                  id="ubicacion"
                  type="text"
                  value={ubicacion}
                  onChange={(e) => setUbicacion(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={resetForm}>
                  Cancelar
                </button>
                <button type="submit" className="submit-btn" disabled={isLoading}>
                  {isLoading ? <div className="spinner"></div> : editId ? "Actualizar" : "Guardar"}
                </button>
              </div>
            </form>
          </div>
        )}

        {!showEventForm && (
          <div className="content-container">
            {viewMode === "list" ? (
              <div className="events-list">
                {isLoading ? (
                  <div className="loading-container">
                    <div className="spinner large"></div>
                    <p>Cargando eventos...</p>
                  </div>
                ) : eventos.length === 0 ? (
                  <div className="no-events">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="48"
                      height="48"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                      <line x1="16" y1="2" x2="16" y2="6"></line>
                      <line x1="8" y1="2" x2="8" y2="6"></line>
                      <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                    <p>No hay eventos registrados</p>
                    {isAdmin && (
                      <button className="add-event-btn small" onClick={() => handleAddEventClick()}>
                        Agregar Evento
                      </button>
                    )}
                  </div>
                ) : (
                  eventos.map((evento) => (
                    <div key={evento.id} className="event-card">
                      <div className="event-header">
                        <h3>{evento.nombre_evento}</h3>
                        {isAdmin && (
                          <div className="event-actions">
                            <button className="action-btn edit" onClick={() => handleEditClick(evento)}>
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                              </svg>
                            </button>
                            <button className="action-btn delete" onClick={() => handleDelete(evento.id)}>
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                <line x1="10" y1="11" x2="10" y2="17"></line>
                                <line x1="14" y1="11" x2="14" y2="17"></line>
                              </svg>
                            </button>
                          </div>
                        )}
                      </div>
                      <div className="event-details">
                        <div className="event-info">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                            <line x1="16" y1="2" x2="16" y2="6"></line>
                            <line x1="8" y1="2" x2="8" y2="6"></line>
                            <line x1="3" y1="10" x2="21" y2="10"></line>
                          </svg>
                          <span>{new Date(evento.fecha_hora).toLocaleString()}</span>
                        </div>
                        {evento.ubicacion && (
                          <div className="event-info">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                              <circle cx="12" cy="10" r="3"></circle>
                            </svg>
                            <span>{evento.ubicacion}</span>
                          </div>
                        )}
                      </div>
                      <p className="event-description">{evento.descripcion}</p>
                    </div>
                  ))
                )}
              </div>
            ) : (
              renderCalendar()
            )}
          </div>
        )}

        {selectedEvent && (
          <div className="event-modal-overlay" onClick={() => setSelectedEvent(null)}>
            <div className="event-modal" onClick={(e) => e.stopPropagation()}>
              <button className="close-modal" onClick={() => setSelectedEvent(null)}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
              <h3>{selectedEvent.nombre_evento}</h3>
              <div className="modal-event-details">
                <div className="event-info">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                  </svg>
                  <span>{new Date(selectedEvent.fecha_hora).toLocaleString()}</span>
                </div>
                {selectedEvent.ubicacion && (
                  <div className="event-info">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                      <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                    <span>{selectedEvent.ubicacion}</span>
                  </div>
                )}
              </div>
              <p className="modal-event-description">{selectedEvent.descripcion}</p>
              {isAdmin && (
                <div className="modal-actions">
                  <button
                    className="modal-btn edit"
                    onClick={() => {
                      handleEditClick(selectedEvent)
                      setSelectedEvent(null)
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                    Editar
                  </button>
                  <button
                    className="modal-btn delete"
                    onClick={() => {
                      handleDelete(selectedEvent.id)
                      setSelectedEvent(null)
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      <line x1="10" y1="11" x2="10" y2="17"></line>
                      <line x1="14" y1="11" x2="14" y2="17"></line>
                    </svg>
                    Eliminar
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default RegistroEvento

