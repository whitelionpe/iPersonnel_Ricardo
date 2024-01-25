import React from "react";

export const BtnEliminar = ({ id, eventDeleteTab = () => {} }) => {
  return (
    <button
      className={"btn_eliminar_tab btn btn-alert btn-sm"}
      id={`sp_${id}`}
      onClick={() => {
        eventDeleteTab(id);
      }}
    >
      {" "}
      x
    </button>
  );
};

const CustomTabNavHeaderItem = ({
  item = {
    id: 0,
    icon: "",
    buttonDelete: false,
    nombre: ""
  },
  index = 0,
  currentTab = 0,
  eventDeleteTab = () => {},
  eventSelectedTab = () => {}
}) => {
  const isFunctionTitle = typeof item.nombre === "function";

  return (
    <li
      className="nav-item nav-item-custom"
      role="presentation"
      key={`li_${index}`}
    >
      <i className={item.icon}></i>
      <a
        style={{ width: "120px" }}
        className={`nav-item-header nav-link dx-tab ${
          currentTab == index ? "dx-tab-selected tab-header-seleccionado" : ""
        } ${item.buttonDelete ? "tab-header-btn-eliminar-tab" : ""}`}
        id={`${item.id}-tab`}
        data-toggle="pill"
        onClick={e => {
          e.preventDefault();
          eventSelectedTab(index);
        }}
        href={`#tabsx-${item.id}`}
        role="tab"
        aria-controls={`tabsx-${item.id}`}
        aria-selected="true"
      >
        {isFunctionTitle ? item.nombre() : item.nombre}
        <span className="nav-alert-view ocultar_elemento">!</span>
        {item.buttonDelete ? (
          <BtnEliminar
            id={item.id}
            index={index}
            eventDeleteTab={eventDeleteTab}
          />
        ) : null}
      </a>
    </li>
  );
};

export default CustomTabNavHeaderItem;
