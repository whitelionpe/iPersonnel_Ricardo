import React from "react";
import PropTypes from "prop-types";

export default function withFileUpload(WrappedComponent) {
    return class WithFileComponent extends React.Component {
        constructor(props) {
            super(props)

            this.state = { files: [], message: "", fileSize: "", fileName: "", fileDate: "" }
            this.fileReader = new FileReader();
            this.addFile = this.addFile.bind(this);
            this.appendFile = this.appendFile.bind(this);
        }

        async addFile(e) {
            const MaxFileSize = (!this.props.MaxFileSize) ? 1200000 : this.props.MaxFileSize;
            const files = e.target.files;
            let fileOk = false;
            let message = "";
            let sizeFile = "";
            let fileName = "";
            let fileDate = "";
            const types = ['application/pdf']//,
            // 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            // 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            // 'image/png', 'image/jpeg', 'image/gif'];
            this.setState({ files: [], message: "", fileSize: "", fileName: "", fileDate: "" });

            Array.prototype.forEach.call(files, function (file, i) {
                fileOk = true;
                //validar tipo de archivo
                fileName = file.name;

                //console.log("addFile...FileType", file.type);

                if (types.every(type => file.type !== type)) {
                    fileOk = false;
                    message = `Puede cargar archivo de tipo : .pdf `;//.xls .doc .png .jpeg .gif
                }



                //Validar maximo tamaño
                sizeFile = formatBytes(file.size, 2);
                if (file.size > MaxFileSize && fileOk) {
                    fileOk = false;
                    //console.log("addFile...FileSize", sizeFile);
                    message = `El tamaño de su archivo ${sizeFile} es mayor al máximo pérmitido ${formatBytes(MaxFileSize, 2)}, por favor cambiar!`
                }
                fileDate = new Date();
            });
            this.setState({
                message: message,
                fileSize: sizeFile,
                fileName: fileName,
                fileDate: fileDate
            })
            if (fileOk) this.fileReader.readAsDataURL(files[0]);
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
                    fileDate={this.state.fileDate}
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


