import React from "react";

export default function withFileUploadImageWithHeight(WrappedComponent) {
  return class WithFileComponent extends React.Component {
    constructor(props) {
      super(props)

      this.state = { files: [], message: "", fileSize: "", fileName: "", fileWidth: "", fileHeight: "" }
      this.fileReader = new FileReader();
      this.addFile = this.addFile.bind(this);
      this.appendFile = this.appendFile.bind(this);
    }

    sleep(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }

    async addFile(e) {
      //console.log("addFile|e:",e);
      const files = e.target.files;
      let fileOk = false;
      let message = "";
      let sizeFile = "";
      let fileName = "";
      let fileWidth = "";
      let fileHeight = "";
      const types = ['image/png', 'image/jpeg', 'image/gif'];

      if (files.length > 0) {

        this.setState({ files: [], message: "", fileSize: "", fileName: "", fileWidth: "", fileHeight: "" });

        files.forEach((file, i) => {
          fileOk = true;
          //validar tipo de archivo
          fileName = file.name;
          if (types.every(type => file.type !== type)) {
            fileOk = false;
            message = `Buscar archivo con extensión de tipo .png .jpeg .gif`;
          }

          let customImg = new Image()
          customImg.src = window.URL.createObjectURL(file);

          sizeFile = formatBytes(file.size, 2);

          //Validar maximo tamaño

          if (file.size > 150000 && fileOk) {
            fileOk = false;
            message = `El tamaño de su archivo ${sizeFile} es mayor al máximo pérmitido ${formatBytes(150000, 2)}, por favor cambiar!`
          }


          customImg.onload = () => {
            fileWidth = customImg.width //+ " px";
            fileHeight = customImg.height //+ " px";

            this.setState({
              message: message,
              fileSize: sizeFile,
              fileName: fileName,
              fileWidth: fileWidth,
              fileHeight: fileHeight
            })
          }
        });

        if (fileOk) this.fileReader.readAsDataURL(files[0]);

      }
    }

    appendFile() {
      this.setState({
        // files: [...this.state.files, this.fileReader.result]
        files: [this.fileReader.result]
      })
    }



    componentDidMount() {
      this.fileReader.addEventListener('load', this.appendFile);
    }

    componentWillUnmount() {
      this.fileReader.removeEventListener('load', this.appendFile);
    }

    render() {
      return (
        <WrappedComponent {...this.props}
          addFile={this.addFile}
          files={this.state.files}
          message={this.state.message}
          fileName={this.state.fileName}
          fileSize={this.state.fileSize}
          fileWidth={this.state.fileWidth}
          fileHeight={this.state.fileHeight}
        />


      )
    }
  }

  function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

}
