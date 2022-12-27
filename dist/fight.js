"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
class Fight {
    constructor() {
        this.players = [{}, {}];
    }
    getPlayers() {
        return this.players;
    }
    setPlayers(params) {
        if (!params)
            return;
        const player = {
            monSelectedId: params.monSelectedId,
            account: (params === null || params === void 0 ? void 0 : params.otherPlayer) || params.creator,
            isCreator: !!params.creator,
            isOtherPlayer: !!params.otherPlayer,
        };
        if (player.isCreator) {
            this.players[0] = player;
        }
        if (player.isOtherPlayer) {
            this.players[1] = player;
        }
    }
    call() {
        return __awaiter(this, void 0, void 0, function* () {
            // const players = this.getPlayers()
            // return players?.length === 2
            //   ? await this.fight(players[0].monSelectedId, players[1].monSelectedId)
            //   : null
            return this.getPlayers();
        });
    }
}
exports.default = Fight;
//# sourceMappingURL=fight.js.map