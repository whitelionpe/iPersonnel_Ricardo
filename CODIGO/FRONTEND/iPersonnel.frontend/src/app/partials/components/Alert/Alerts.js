import React from "react";
import { injectIntl } from "react-intl";
// import { WithLoandingPanel } from "../../../../partials/content/withLoandingPanel";
import { makeStyles } from "@material-ui/core/styles";
import { Alert, AlertTitle } from "@material-ui/lab";

const useStyles = makeStyles(theme => ({
  root: {
    width: "100%",
    "& > * + *": {
      marginTop: theme.spacing(2)
    }
  }
}));

const Alerts = props => {
  const { intl } = props;
 // console.log("Alerts:props:", props);
  const classes = useStyles();

  return (
    <>
      &nbsp;
      <div className={classes.root}>
        {props.severity === "error" && (
          <Alert severity="error">
            <AlertTitle> {intl.formatMessage({ id: "MESSAGES.ERROR" })} </AlertTitle>
            <strong>{props.msg1}</strong> {props.msg2}
          </Alert>
        )}

        {props.severity === "warning" && (
          <Alert  severity="warning">
            <AlertTitle> {intl.formatMessage({ id: "MESSAGES.WARNING" })} </AlertTitle>
            <strong>{props.msg1}</strong> {props.msg2}
          </Alert>
        )}

        {props.severity === "info" && (
          <Alert  severity="info">
            <AlertTitle> {intl.formatMessage({ id: "MESSAGES.INFO" })} </AlertTitle>
            <strong>{props.msg1}</strong> {props.msg2}
          </Alert>
        )}

        {props.severity === "success" && (
          <Alert severity="success">
            <AlertTitle>{intl.formatMessage({ id: "MESSAGES.SUCCESS" })}</AlertTitle>
            <strong>{props.msg1}</strong> {props.msg2}
          </Alert>
        )}
      </div>
    </>
  );
};

export default injectIntl(Alerts);
