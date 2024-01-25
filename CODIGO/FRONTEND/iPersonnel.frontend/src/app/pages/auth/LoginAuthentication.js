import React, { useState } from 'react';

import { TextField } from "@material-ui/core";
//import Select from "@material-ui/core/Select";
//import InputLabel from "@material-ui/core/InputLabel";
//import MenuItem from "@material-ui/core/MenuItem";
import { FormattedMessage } from "react-intl";

import { makeStyles } from '@material-ui/core/styles';
import Alert from '@material-ui/lab/Alert';

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
    '& > * + *': {
      marginTop: theme.spacing(2),
    },
  },
  derecha: {
    float: 'right',
    paddingTop: '10px',
    marginTop: '2px!important'
  }
}));

const LoginAuthentication = (props) => {

  //console.log("LoginAuthentication.message--->", props.msjConfirmCodigo)

  const classes = useStyles();
  const [codigo, setCodigo] = useState("");
  const [disabledSend, setDisabledSend] = useState(true);

  return (
    <form
      id="idFormLoginAuthentication"
      autoComplete="off"
      className="kt-form">
      <div role="alert" className="alert alert-info">
        <div className="alert-text">
          {`${props.intl.formatMessage({ id: "AUTH.LOGIN.TITLE.AUTHENTICATION" }).toUpperCase()} ${props.EsTelefono === "S" ? props.intl.formatMessage({ id: "AUTH.LOGIN.TITLE.AUTHENTICATION_TELF" }).toUpperCase() : props.intl.formatMessage({ id: "AUTH.LOGIN.TITLE.AUTHENTICATION_CORR" }).toUpperCase()}`}
        </div>
      </div>
      <div className="form-group">
        <TextField
          type="text"
          label={props.intl.formatMessage({ id: "AUTH.INPUT.USERNAME" })}
          margin="normal"
          className="kt-width-full"
          name="username"
          value={props.perfiles[0].IdUsuario}
          variant="outlined"
        />
      </div>

      <div className="form-group">
        <div className="MuiFormControl-root MuiTextField-root kt-width-full MuiFormControl-marginNormal">

          <TextField
            id="CodigoVerificacion"
            label="Código de verificación"
            type="number"
            InputLabelProps={{
              shrink: true,
            }}
            inputProps={{
              maxLength: 4,
              min: "0",
              max: "9999"
            }}

            margin="normal"
            className="kt-width-full"
            variant="outlined"
            onInput={(e) => {

              if (e.target.value.length > 4) {
                e.target.value = e.target.value.slice(-4);
                setCodigo(e.target.value);
              }
              setDisabledSend(e.target.value.length !== 4);
            }}

            onKeyDown={(e) => {
              // setDisabledSend(e.target.value.length !== 4);
              if (e.key === "Enter" && e.target.value.length === 4) {
                //console.log("Enter", e.target.value);
                setCodigo(e.target.value);
                props.confirmarCodigoVerificacion(e.target.value);
              }
            }}
            
          />

        </div>
      </div>
      <div className="form-group">
        {(props.msjConfirmCodigo === '') ? null : (
          <div className={classes.root}>
            <Alert severity="warning">
              {props.msjConfirmCodigo.toUpperCase()}
            </Alert>
          </div>
        )}
      </div>

      {/* <div className="form-group"> */}
      <div className={`kt-login__actions ${classes.derecha}`}>
        <button
          id="kt_login_signin_submit"
          type="button"
          disabled={disabledSend}
          className={`classCerrarSesion`}
          // style={loadingButtonStyle}
          onClick={() => {
            let codigo = document.getElementById("CodigoVerificacion").value;
            if (codigo.length === 4) {
              props.confirmarCodigoVerificacion(codigo);
            }
          }}
        >
          <FormattedMessage id="AUTH.LOGIN.BUTTON.SEND" />
        </button>
      </div>
      {/* </div> */}

      <a onClick={() => { props.ReenviarCodigo() }}>
        <FormattedMessage id="AUTH.LOGIN.BUTTON.RESEND" />
      </a>

    </form>)
};

export default LoginAuthentication;
