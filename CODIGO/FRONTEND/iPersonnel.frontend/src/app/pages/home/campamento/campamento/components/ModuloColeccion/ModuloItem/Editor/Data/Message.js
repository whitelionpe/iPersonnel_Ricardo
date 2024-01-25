import React from "react";
import { injectIntl } from "react-intl"; 

import "./style.css";
import SwalAlert from "../../../../../../../../../partials/components/SwalAlert";

const ModuloItemEditorDataMessage = () => {
  const props = {
    title: 'Éxito',
    message: 'El módulo se guardó satisfactoriamente.',
    type: 'success',
  };

  return (
    <SwalAlert { ...props }/>
  );
};

export default injectIntl(ModuloItemEditorDataMessage);
