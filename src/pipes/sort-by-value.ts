import { Pipe } from '@angular/core';

@Pipe({
    name: 'sortByValue'
})
export class SortByValue {
    transform(filters, sort: boolean) {
        if (filters && sort) {
            return filters.sort((a, b) => a.Value - b.Value);
        }

        return filters;
    }
}
