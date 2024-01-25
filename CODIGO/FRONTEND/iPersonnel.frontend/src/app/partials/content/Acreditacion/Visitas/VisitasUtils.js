import { convertyyyyMMddToDate } from "../../../../../_metronic";

export const cargarRequisitosDatoEvaluar = (
    datosRequisitos,
    datosDatosEvaluar,
    datosPersonaDatosEvaluar,
    datosDatosEvaluarDetalle = []
) => {
    //console.log({ datosRequisitos, datosDatosEvaluar, datosPersonaDatosEvaluar, datosDatosEvaluarDetalle });
    let tmpRequisitos = [];
    let datos = {};
    //Casrga de los requisitos
    for (let i = 0; i < datosRequisitos.length; i++) {
        tmpRequisitos.push({
            Value: datosRequisitos[i].IdRequisito,
            Text: datosRequisitos[i].Requisito,
            AdjuntarArchivo: "N",
            Tipo: "G",
            ValorDefecto: "",
            IdRequisito: "",
            NombreArchivo: "",
            Index: `R|${datosRequisitos[i].IdRequisito}|${datosRequisitos[i].IdRequisito}`,
            Automatico: false,
            ViewAcreditacion: false
        });

        //Cargamos los datos a evaluar del requisito
        let datosEvaluar = datosDatosEvaluar.filter(
            x => x.IdRequisito === datosRequisitos[i].IdRequisito
        );

        // console.log("JDL_datosEvaluar",datosEvaluar);
        for (let i = 0; i < datosEvaluar.length; i++) {
            tmpRequisitos.push({
                Value: datosEvaluar[i].IdDatoEvaluar,
                Text: datosEvaluar[i].DatoEvaluar,
                AdjuntarArchivo: datosEvaluar[i].AdjuntarArchivo,
                Tipo: datosEvaluar[i].Tipo,
                ValorDefecto: "",
                IdRequisito: datosEvaluar[i].IdRequisito,
                NombreArchivo: "",
                Index: `R|${datosEvaluar[i].IdRequisito}|${datosEvaluar[i].IdDatoEvaluar}`,
                Automatico: false,
                ViewAcreditacion: false
            });
        }
    }

    //Se cargan los datos de requisitos para las personas de
    //acuerdo a los requisitos existentes:
    //Se cargan los requisitos de las personas:
    let arrayRequisitosPersona = [];
    for (let j = 0; j < tmpRequisitos.length; j++) {
        let cr = tmpRequisitos[j];
        //if (cr.Tipo === "G") continue;

        let datoRequisito = datosPersonaDatosEvaluar.find(
            x => x.IdDatoEvaluar === cr.Value && x.IdRequisito === cr.IdRequisito
        );



        let listaCombo = datosDatosEvaluarDetalle.filter(x => x.IdDatoEvaluar === cr.Value)

        //console.log("Se carga datos de lista", { cr, listaCombo });

        if (listaCombo.length > 0) {
            cr.Lista = listaCombo;
        }
        /*console.log("Dentro del for", {
            cr,
            datosPersonaDatosEvaluar,
            datoRequisito
        });*/
        if (!!datoRequisito) {
            cr = {
                ...cr,
                IdSolicitud: datoRequisito.IdSolicitud,
                IdSecuencial: datoRequisito.IdSecuencial,
                Tipo: datoRequisito.Tipo,
                [`D|${datoRequisito.IdRequisito}|${datoRequisito.IdDatoEvaluar}`]:
                    datoRequisito.Tipo === "F" && datoRequisito.Valor !== ""
                        ? convertyyyyMMddToDate(datoRequisito.Valor)
                        : datoRequisito.Tipo === "L"
                            ? datoRequisito.Valor
                            : datoRequisito.ValorDescrip,
                NombreArchivo: datoRequisito.NombreArchivo,
                Index: `D|${datoRequisito.IdRequisito}|${datoRequisito.IdDatoEvaluar}`,
                EstadoAprobacion: datoRequisito.EstadoAprobacion,
                Observacion: datoRequisito.Observacion,
                Automatico: false,
                ViewAcreditacion: false,
                Aprobar: datoRequisito.Aprobar,
                UsuarioAprobacion: datoRequisito.UsuarioAprobacion,
                FechaAprobacion: datoRequisito.FechaAprobacion,
                HoraAprobacion: datoRequisito.HoraAprobacion
            };
        }
        // console.log("_JDL_(2)_datoRequisito",datoRequisito);
        // console.log("_JDL_i", { cr });
        /*
   END AS Aprobar
   END AS UsuarioAprobacion
   END AS FechaAprobacion
   END AS HoraAprobacion 
  */
        //Agregando value:
        if (cr.Tipo !== "G") {
            datos[cr.Index] = cr[cr.Index];
            datos[`${cr.Index}|OBS`] = cr.Observacion; //Agregando Observacion
            datos[`${cr.Index}|CHECK`] = cr.EstadoAprobacion; //Agregando EstadoAprobacion
        }
       // console.log("JDL_(3)-datos,",datos);

        arrayRequisitosPersona.push(cr);
    }
    //Se agregan los requisitos:

    return { datosPersona: datos, datosEvaluar: arrayRequisitosPersona };
};

