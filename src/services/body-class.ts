import { Injectable } from '@angular/core';

@Injectable()
export class BodyClass {
    /**
     * Body element.
     *
     * @return {Element}
     */
    public body: Element = document.querySelector('BODY');

    /**
     * Add a class name to the body.
     *
     * @param  {string} class_name
     * @return {void}
     */
    add(class_name: string): void {
        this.body.classList.add(class_name);
    }

    /**
     * Remove a class name from the body.
     *
     * @param  {string} class_name
     * @return {void}
     */
    remove(class_name: string): void {
        this.body.classList.remove(class_name);
    }
}
