import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { connect } from "react-redux";

import anime from "animejs";

import * as constants from "./constants";

import {
    CompositionState,
    PlayerState,
    Property,
    RendererState,
    StoreState,
} from "./types/";

import Svg from "./Svg";

import { keyframesToAnimators } from "./helpers/layer";

interface IdispatchProps {
    onUpdateAnimators: () => void;
}

interface IStateToProps {
    composition: CompositionState;
    player: PlayerState;
    renderer: RendererState;
}

interface IRendererState {
    properties: Property[];
}

export type RendererProps = IStateToProps & IdispatchProps;

const ratio = 2;

class Renderer extends React.Component<RendererProps, IRendererState> {

    private layers: any[];
    private properties: any;
    private img: HTMLImageElement;
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;

    constructor(props: RendererProps) {
        super(props);

        this.properties = [];
        this.layers = [];
    }
    public drawImage() {
        try {
            if (this.ctx && this.img) {
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                this.ctx.drawImage(this.img, 0, 0);
            }
        } catch (e) {
            console.log(e);
        }
    }
    public imageLoaded() {
        this.drawImage();
    }

    public componentDidMount() {
       const canvas: HTMLCanvasElement = document.getElementById("canvas") as HTMLCanvasElement;
       const rendererImg = document.getElementById("renderer") as HTMLImageElement;
       let ctx;
       if (canvas && rendererImg) {
           ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
           rendererImg.onload = () => {
               this.imageLoaded();
           };

           this.canvas = canvas;
           this.ctx = ctx;
           this.img = rendererImg;
       }

    }

    public updateCanvasDimensions() {
        if (this.canvas && this.ctx) {
            if (ratio * this.props.composition.width !== this.canvas.width ||
                ratio * this.props.composition.height !== this.canvas.height) {
                this.canvas.width = this.props.composition.width * ratio;
                this.canvas.height = this.props.composition.height * ratio;

                this.canvas.style.width = this.props.composition.width + "px";
                this.canvas.style.height = this.props.composition.height + "px";
                this.ctx = this.canvas.getContext("2d") as CanvasRenderingContext2D;
                this.ctx.scale(ratio, ratio);
            }
        }
    }

    public render() {
        this.updateCanvasDimensions();

        if (this.props.renderer.animatorsDirty) {
            this.properties = [];
            this.layers = [];
            this.props.composition.layers.forEach((l) => {
                const keyframes = l.keyframes;
                const values = {};
                this.layers.push(values);
                this.properties.push(keyframesToAnimators(keyframes, values));
            });
            this.props.onUpdateAnimators();
        }

        this.properties.forEach((l: any) => {
            Object.keys(l).forEach((p: string) => {
                const anim: anime.AnimeInstance = l[p].animation;
                if (anim) {
                    const ms = 1.0 / this.props.player.fps * 1000;
                    anim.seek(this.props.player.currentFrame * ms);
                }
            });
        });

        const layers: any[] = [];
        this.layers.forEach((values) => {
            const style: React.CSSProperties = {
                left: values.x as number,
                position: "absolute",
                top: values.y as number,
            };
            layers.push(<div key={layers.length} style={style}>ciao</div>);
        });
        let data = renderToStaticMarkup(
            <Svg width={this.props.composition.width} height={this.props.composition.height}>
                {layers}
            </Svg>,
        );
        data = encodeURIComponent(data);
        const newSrc = `data:image/svg+xml,${data}`;
        if (this.img) {
            const src = this.img.src;
            if (src !== newSrc) {
                this.img.src = newSrc;
            }
        }
        return (
            <div className="renderer" />
        );
    }
}
const mapStateToProps = (state: StoreState): IStateToProps => ({
    composition: state.composition,
    player: state.player,
    renderer: state.renderer,
});

const mapDispatchToProps = (dispatch: any, ownProps: any): IdispatchProps => ({
    onUpdateAnimators: () => {
        dispatch({
            type: constants.ANIMATORS_UPDATED,
        });
    },

});

const RendererConnected = connect(mapStateToProps, mapDispatchToProps)(Renderer);

export default RendererConnected;
