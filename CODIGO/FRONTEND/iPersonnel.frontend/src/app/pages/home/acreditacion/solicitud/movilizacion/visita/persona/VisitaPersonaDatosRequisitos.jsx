import React, { Fragment } from "react";

import {
  downloadFile as downloadFileDetalle,

} from "../../../../../../../api/acreditacion/visitaPersonaDetalle.api";
import CustomItemRow from "../../../../../../../partials/content/Acreditacion/CustomItem/CustomItemRow";
import FieldsetAcreditacion from '../../../../../../../partials/content/Acreditacion/FieldsetAcreditacion/FieldsetAcreditacion';

const VisitaPersonaDatosRequisitos = ({
  intl,
  setLoading,
  visita,
  setOptRequisito,
  optRequisito,
  setVerPopup = false,
  setFileView = true,
  personaRequisitos,
  setpersonaRequisitos,
  modoEdicion,
  configuracionPeso
}) => {

  const descargarArchivo = async (item) => {
    //console.log("descargarArchivo", { item });
    if (item.IdSolicitud !== 0) {
      await downloadFileDetalle({
        IdSolicitud: visita.IdSolicitud,
        IdSecuencial: item.IdSecuencial,
        IdDatoEvaluar: item.Value
      }).then(res => {
        var a = document.createElement("a"); //Create <a>
        a.href = res.file; //Image Base64 Goes here
        a.download = res.name; //File name Here
        a.click(); //Downloaded file
      });
    }
  };

  const itemListOnChange = (value, index, list) => {

    let element = list.find(x => x.IdDato === value);

    if (index !== "" && index !== undefined) {
      let [, IdRequisito, IdDatoEvaluar] = index.split("|");

      //console.log({ IdRequisito, IdDatoEvaluar });
      if (!!IdDatoEvaluar && !!IdRequisito) {
        element = list.find(x => x.IdDato === value
          && x.IdRequisito === IdRequisito && x.IdDatoEvaluar === IdDatoEvaluar);
      }
    }

    if (!!element) {

      setpersonaRequisitos(prev => (
        prev.map(x => x.Index === index ? { ...x, AdjuntarArchivo: element.AdjuntarArchivo } : x)
      ));


    }


  }

  const grupos = personaRequisitos.filter(x => x.Tipo === 'G');

  return (
    <Fragment>

      {
        grupos.map(grupo => (
          <FieldsetAcreditacion title={(grupo.Text || "").toLocaleLowerCase()}>
            <div>
              {personaRequisitos.map((item, i) => {
                return (personaRequisitos.Tipo !== 'G' && item.IdRequisito === grupo.Value ? (
                  <CustomItemRow
                    key={`CIRPD_${visita.Documento}_${i}`}
                    item={item}
                    EstadoAprobacionRequisito={item.EstadoAprobacion}
                    RechazoIndisciplina={visita.RechazoIndisciplina}
                    modoEdicion={modoEdicion}
                    dataRowEditRequisitos={visita}
                    EstadoAprobacion={visita.EstadoAprobacion}
                    IdSolicitud={visita.IdSolicitud}
                    optRequisito={optRequisito}
                    maxSizeFile={configuracionPeso.Valor1}
                    //eventClick={descargarArchivo}
                    eventViewDocument={descargarArchivo}
                    intl={intl}         
                    colSpanItem={4}
                    itemListOnChange={itemListOnChange}
                    labelTop={true}
                  />) : null
                );
              })}
            </div>
          </FieldsetAcreditacion>
        ))
      }

    </Fragment>
  );
};

export default VisitaPersonaDatosRequisitos;
