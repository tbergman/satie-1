import React = require("react");
import DAWComponent from "./dawComponent";

@DAWComponent("live.effects.soundfont.Soundfont", 2)
class Soundfont extends React.Component<
    {
        children?: any
    },
    {
        remote?: any
    }> {

    componentDidMount() {
        this.setRemoteState({
            soundfont: "/Users/josh/ripieno/dragon/vendor/gm/gm.sf2",
            channels: [
                {
                    program: 0
                }
            ]
        });
    }

    setRemoteState: (remoteState: any) => void;
    
    render() {
        console.log(this.state);
        return <span>
            {this.props.children}
        </span>;
    }
};

export default Soundfont;