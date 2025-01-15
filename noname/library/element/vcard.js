import { get } from "../../get/index.js";
import { lib } from "../index.js";
import { _status } from "../../status/index.js";
import { ai } from "../../ai/index.js";

export class VCard {
	/**
	 * @param { any } [suitOrCard]
	 * @param { number | Card[] } [numberOrCards]
	 * @param { string } [name]
	 * @param { string } [nature]
	 * @param { Player | false } [owner]
	 */
	constructor(suitOrCard, numberOrCards, name, nature, owner) {
		if (Array.isArray(suitOrCard)) {
			/**
			 * @type {string}
			 */
			this.suit = suitOrCard[0];
			/**
			 * @type {number}
			 */
			this.number = suitOrCard[1];
			/**
			 * @type {string}
			 */
			this.name = suitOrCard[2];
			/**
			 * @type {string}
			 */
			this.nature = suitOrCard[3];
		}
		// @ts-ignore
		else if (get.itemtype(suitOrCard) == "card") {
			this.name = get.name(suitOrCard, owner);
			this.xiBie = get.xiBie(suitOrCard, owner);
			//this.color = get.color(suitOrCard, owner);
			this.mingGe = get.mingGe(suitOrCard, owner);
			this.duYou = get.duYou(suitOrCard, owner);
			/**
			 * @type { boolean }
			 */
			this.isCard = true;
			this.cardid = suitOrCard.cardid;
			this.wunature = suitOrCard.wunature;
			/**
			 * @type {Record<string, any>}
			 */
			this.storage = get.copy(suitOrCard.storage);
			if (Array.isArray(numberOrCards)) this.cards = numberOrCards.slice();
			else this.cards = [suitOrCard];
			const info = get.info(this, false);
			if (info) {
				const autoViewAs = info.autoViewAs;
				if (typeof autoViewAs == "string") this.name = autoViewAs;
			}
		} else if (suitOrCard && typeof suitOrCard != "string") {
			Object.keys(suitOrCard).forEach((key) => {
				/**
				 * @type { PropertyDescriptor }
				 */
				// @ts-ignore
				const propertyDescriptor = Object.getOwnPropertyDescriptor(suitOrCard, key),
					value = propertyDescriptor.value;
				if (Array.isArray(value)) this[key] = value.slice();
				else Object.defineProperty(this, key, propertyDescriptor);
			});
			if (Array.isArray(numberOrCards)) {
				const noCards = !this.cards;
				/**
				 * @type { Card[] }
				 */
				this.cards = numberOrCards.slice();
				if (noCards) {
					if (!lib.xiBies.includes(this.xiBie)) this.xiBie = get.xiBie(this, owner);
					//if (!Object.keys(lib.color).includes(this.color)) this.color = get.color(this, owner);
					//if (typeof this.number != "number") this.number = get.mingGe(this, owner);
					if (! this.mingGe) this.mingGe = get.mingGe(this, owner);
					if (!this.duYou) this.duYou = get.duYou(this, owner);
				}
			} else if (numberOrCards === "unsure" && !this.isCard) {
				if (!this.xiBie) this.xiBie = "unsure";
				//if (!this.color) this.color = "unsure";
				if (!this.mingGe) this.mingGe = "unsure";
			}
			const info = get.info(this, false);
			if (info) {
				const autoViewAs = info.autoViewAs;
				if (typeof autoViewAs == "string") this.name = autoViewAs;
			}
		}
		if (typeof suitOrCard == "string") this.suit = suitOrCard;
		if (typeof numberOrCards == "number") this.number = numberOrCards;
		if (typeof name == "string") this.name = name;
		if (typeof nature == "string") this.nature = nature;
		if (!this.storage) this.storage = {};
		if (!this.cards) this.cards = [];
	}
	sameXiBieAs(card) {
		return get.xiBie(this) == get.xiBie(card);
	}
	differentXiBieFrom(card) {
		return get.xiBie(this) != get.xiBie(card);
	}
	sameMingGeAs(card) {
		return get.mingGe(this) == get.mingGe(card);
	}
	differentMingGeFrom(card) {
		return get.mingGe(this) != get.mingGe(card);
	}
	sameNameAs(card) {
		return get.name(this) == get.name(card);
	}
	differentNameFrom(card) {
		return get.name(this) != get.name(card);
	}
	/**
	 * @param { Player } player
	 */
	//hasDuYou(nature, player) {
	hasDuYou(duYou, player) {
		const duYous = get.duYouList(this, player);
		if (!duYou) return duYous.length > 0;
		if (duYou == "linked") return duYous.some((n) => lib.linked.includes(n));
		return get.is.sameNature(duYous, duYou);
	}
	/**
	 * 返回一个键值，用于在缓存中作为键名。
	 * @param { boolean } [similar] true伪equals, false统一前缀
	 * @returns {string} cacheKey
	 */
	getCacheKey(similar) {
		let prefix = "[object:";
		if (similar !== false) prefix = similar ? "[card:" : "[vcard:";
		if (this.cardid) return prefix + this.cardid + "]";
		if (!this.cards.length) return prefix + `${this.name}+${
			this.suit ? this.suit : (this.color || "none")
		}+${
			this.number === undefined ? "none" : this.number
		}${
			this.nature ? "+" + this.nature : ""
		}]`;
		if (similar !== undefined && this.cards.length === 1) return ai.getCacheKey(this.cards[0], similar);
		return prefix + "[array:[" + this.cards.map(i => {
			return ai.getCacheKey(i, similar);
		}).join("-") + "]]]";
	}
	hasGaintag(tag) {
		return this.gaintag && this.gaintag.includes(tag);
	}
	initID() {
		if (!this.vcardID){
			this.vcardID = get.id();
			if (lib.vcardOL) lib.vcardOL[this.vcardID] = this;
		}
	}
}
