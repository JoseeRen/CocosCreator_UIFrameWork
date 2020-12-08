import TextureAssembler from "../Assemblers/TextureAssembler";
import { CommonUtils } from "../Utils/CommonUtils";

const renderEngine = cc.renderer.renderEngine;

enum TextureType {
    Cut,            // 裁剪
    Stretch         // 拉伸, 暂未实现
}

let _vec2_temp = new cc.Vec2();
let _mat4_temp = new cc.Mat4();

const {ccclass, inspector, executeInEditMode, mixins, property} = cc._decorator;

@ccclass
@executeInEditMode
// @inspector('packages://inspector/share/blend.js')
// @mixins(cc.BlendFunc)
export default class TexturePlus extends cc.RenderComponent {
    static Type = TextureType;

    @property(cc.Texture2D)
    _texture: cc.Texture2D = null;
    @property(cc.Texture2D)
    get texture() {
        return this._texture;
    }
    set texture(val: cc.Texture2D) {
        this._texture = val;
        this._updateMaterial()
    }

    _type: TextureType = 0;
    @property({type: cc.Enum(TextureType), serializable: true})
    get type() {
        return this._type;
    }
    set type(val: TextureType) {
        this._type = val;
        this.setVertsDirty();
    }

    @property({type: [cc.Vec2], serializable: true})
    _polygon: cc.Vec2[] = [];
    @property({type: [cc.Vec2], serializable: true})
    public get polygon() {
        return this._polygon;
    }
    public set polygon(points: cc.Vec2[]) {
        this._polygon = points;
        this._updateVerts();
    }

    @property(cc.Boolean)
    editing: boolean = false;
    
    _assembler: cc.Assembler = null;

    start() {
        
    }

    private _updateVerts() {
        this.setVertsDirty();
    }

    public _updateMaterial() {
        let texture = this._texture;
        let material = this.getMaterial(0);
        if(material) {
            if(material.getDefine("USE_TEXTURE") !== undefined) {
                material.define("USE_TEXTURE", true);
            }
            material.setProperty("texture", texture);
        }
        this.setVertsDirty();
        
        // cc.BlendFunc.prototype['_updateMaterial'].call(this);
    }

    public _validateRender() {
        
    }

    public _resetAssembler() {
        let assembler = this._assembler = new TextureAssembler();
        assembler.init(this);
        this._updateColor();
        this.setVertsDirty();
    }

    private _hitTest (cameraPt: cc.Vec2) {
        let node = this.node;
        let size = node.getContentSize(),
            w = size.width,
            h = size.height,
            testPt = _vec2_temp;
        
        node['_updateWorldMatrix']();
        // If scale is 0, it can't be hit.
        if (!cc.Mat4.invert(_mat4_temp, node['_worldMatrix'])) {
            return false;
        }
        cc.Vec2.transformMat4(testPt, cameraPt, _mat4_temp);
        testPt.x += node['_anchorPoint'].x * w;
        testPt.y += node['_anchorPoint'].y * h;

        return CommonUtils.isInPolygon(testPt, this.polygon);
    }
}