import React from "react";
import "./FieldsetAcreditacion.css";
const FieldsetAcreditacion = ({ title = "", children = undefined }) => {
  return (
    <fieldset className="acreditacion-fieldset">
      <legend className="acreditacion-legend" style={{ background: '#7f7f7f' }}>
        <h6 className="fondoGrissPanel">{title}</h6>
      </legend>

      {!!children &&
        Array.isArray(children) &&
        children.map((child, index) => (
          <div key={`fs_item_${index}`}>{child}</div>
        ))}

      {!!children && !Array.isArray(children) && <div>{children}</div>}
    </fieldset>
  );
};

export default FieldsetAcreditacion;
