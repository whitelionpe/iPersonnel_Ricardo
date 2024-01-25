//import { Item } from "devextreme-react/accordion";
import React, { useEffect, useState } from "react";
import CustomItemRow from "../../../../../../../partials/content/Acreditacion/CustomItem/CustomItemRow";

const VisitaRequisitosPersonaPage = ({
  visita = {}, //Datos de las visitas
  personasRequisitos = [], //Los requisitos de las personas
  requisitos = [], //Lista de requisitos configurados al perfil
  modoEdicion,
  configuracionPeso,
  descargarArchivo,
  eventViewDocument,
  intl
}) => {
  //   const [visita, setVisita] = useState({});
  const [personaRequisitos, setPersonaRequisito] = useState([]);
  const [documento, setDocumento] = useState(visita.Documento);

  useEffect(() => {
   
    if (documento !== "") {
      let requerimentsFound = personasRequisitos.find(
        x => x.Documento === visita.Documento
      );
      if (!!requerimentsFound) {
        setPersonaRequisito(requerimentsFound.Requisitos);
      }
    }
  }, [personasRequisitos, documento]);

  return (
    <>
      {personaRequisitos.map((item, i) => (
        <CustomItemRow
          key={`CIRPD_${visita.Documento}_${i}`}
          item={item}
          EstadoAprobacionRequisito={item.EstadoAprobacion}
          RechazoIndisciplina={visita.RechazoIndisciplina}
          modoEdicion={modoEdicion}
          dataRowEditRequisitos={item}
          EstadoAprobacion={visita.EstadoAprobacion}
          IdSolicitud={visita.IdSolicitud}
          optRequisito={requisitos}
          maxSizeFile={configuracionPeso.Valor1}
          eventClick={descargarArchivo}
          eventViewDocument={eventViewDocument}
          intl={intl}
        />
      ))}
    </>
  );
};

export default VisitaRequisitosPersonaPage;
