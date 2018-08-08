import { DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { ChoiceGroup, IChoiceGroupOption } from 'office-ui-fabric-react/lib/ChoiceGroup';
import { MessageBar, MessageBarType } from 'office-ui-fabric-react/lib/MessageBar';
import { Spinner } from 'office-ui-fabric-react/lib/Spinner';
import * as React from 'react';

import { packagedFile, winmlDataFolder } from '../../persistence/appData';
import { downloadPip, downloadProtobuf, downloadPython, getLocalPython, getPythonBinaries, installVenv, pip, python } from '../../python/python';

import './View.css';

enum Step {
    Idle,
    Downloading,
    GetPip,
    GetProtobuf,
    CreatingVenv,
    InstallingRequirements,
    Converting,
}

interface IComponentState {
    currentStep: Step,
    error?: Error | string,
}

export default class ConvertView extends React.Component<{}, IComponentState> {
    private venvPython?: string;
    private electron?: typeof Electron;

    constructor(props: {}) {
        super(props);
        if (winmlDataFolder === '/') {
            this.state = {
                currentStep: Step.Idle,
                error: "The converter can't be run in the web interface",
            };
            return;
        }
        import('electron')
            .then(mod => this.electron = mod)
            .catch(this.printError);
        this.state = { currentStep: Step.Idle };
    }

    public render() {
        return (
            <div className='ConvertView'>
                {this.getView()}
            </div>
        )
    }

    private getView() {
        const { error } = this.state;
        if (error) {
            const message = typeof error === 'string' ? error : (`${error.stack ? `${error.stack}: ` : ''}${error.message}`);
            return <MessageBar messageBarType={MessageBarType.error}>{message}</MessageBar>
        }
        switch (this.state.currentStep) {
            case Step.Downloading:
                return <Spinner label="Downloading Python..." />;
            case Step.GetPip:
                return <Spinner label="Getting pip in embedded Python..." />;
            case Step.GetProtobuf:
                return <Spinner label="Getting protobuf..." />;
            case Step.CreatingVenv:
                return <Spinner label="Creating virtual environment..." />;
            case Step.InstallingRequirements:
                return <Spinner label="Downloading and installing requirements..." />;
            case Step.Converting:
                return <Spinner label="Converting..." />;
        }
        this.venvPython = this.venvPython || getLocalPython();
        if (!this.venvPython) {
            return this.pythonChooser();
        }
        return <DefaultButton style={{ height: '100vh', width: '100%' }} text='Open file' onClick={this.convert}/>;
    }

    private pythonChooser = () => {
        const binaries = getPythonBinaries();
        const options = binaries.map((key) => key ? { key, text: key } : { key: '__download', text: 'Download a new Python binary to be used exclusively by the WinML Dashboard' });
        const onChange = async (ev: React.FormEvent<HTMLInputElement>, option: IChoiceGroupOption) => {
            try {
                if (option.key === '__download') {
                    this.setState({ currentStep: Step.Downloading });
                    await downloadPython();
                    this.setState({ currentStep: Step.GetPip });
                    await downloadPip();
                    this.setState({ currentStep: Step.GetProtobuf });
                    await downloadProtobuf();
                } else {
                    this.setState({ currentStep: Step.CreatingVenv });
                    await installVenv(option.key);
                }
                this.setState({ currentStep: Step.InstallingRequirements });
                await pip(['install', '-r', packagedFile('requirements.txt')], {
                    stderr: print,
                    stdout: print,
                });
                this.setState({ currentStep: Step.Idle });
            } catch (error) {
                this.printError(error);
            }
        }
        // TODO Options to reinstall environment or update dependencies
        return (
            <ChoiceGroup
                options={options}
                label={binaries[0] ? 'Suitable Python versions were found in the system. Pick one to be used by the converter.' : 'No suitable Python versions were found in the system.'}
                onChange={onChange}
            />
        );
    }

    private convert = () => {
        if (!this.electron) {
            return;
        }
        const { dialog } = this.electron.remote;
        const openDialogOptions = {
            filters: [
                { name: 'CoreML model', extensions: [ 'mlmodel' ] },
                { name: 'Keras model', extensions: [ 'json', 'keras', 'h5' ] },
            ],
            properties: Array<'openFile'>('openFile'),
        };
        dialog.showOpenDialog(openDialogOptions, (filePaths: string[]) => {
            if (filePaths[0]) {
                dialog.showSaveDialog({ filters: [{ name: 'ONNX model', extensions: ['onnx'] }] }, (destination: string) => {
                    if (destination) {
                        this.setState({ currentStep: Step.Converting });
                        python([packagedFile('convert.py'), filePaths[0], destination], {}, {
                            stderr: print,
                            stdout: print,
                        })
                            .then(() => this.setState({ currentStep: Step.Idle }))
                            .catch(this.printError);
                    }
                });
            }
        });
    }

    private print = (message: string) => {
        // TODO have a UI text box and show the installation output
        // tslint:disable-next-line:no-console
        console.log(message);
    }

    private printError = (error: string | Error) => {
        this.setState({ currentStep: Step.Idle, error });
    }
}
