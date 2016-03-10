import $ from 'jquery';

var storage = window.sessionStorage || {}, svgs = {};

export default function (UIkit) {

    UIkit.mixin.svg = {

        props: {id: String, class: String, style: String, width: Number, height: Number, ratio: Number},

        defaults: {ratio: 1, id: false, class: '', exclude: []},

        methods: {

            get(src) {

                if (svgs[src]) {
                    return svgs[src];
                }

                var key = 'uikit_' + UIkit.version + '_' + src;
                svgs[src] = $.Deferred();

                if (!storage[key]) {
                    $.get(src, 'text').then((doc, status, res) => {
                        storage[key] = res.responseText;
                        svgs[src].resolve(storage[key]);
                    });
                } else {
                    svgs[src].resolve(storage[key]);
                }

                return svgs[src];
            },

            getIcon(src, icon) {

                return this.get(src).then(doc => {

                    var el = $('#' + icon, doc);

                    if (!el || !el.length) {
                        return $.Deferred().reject('Icon not found.');
                    }

                    el = $($('<div>').append(el.clone()).html().replace(/symbol/g, 'svg')); // IE workaround, el[0].outerHTML

                    return this.addProps(el);
                });

            },

            addProps(el) {
                var dimensions = el[0].getAttribute('viewBox'); // jQuery workaround, el.attr('viewBox')
                if (dimensions) {
                    dimensions = dimensions.split(' ');
                    this.width = this.width || dimensions[2];
                    this.height = this.height || dimensions[3];
                }

                this.width *= this.ratio;
                this.height *= this.ratio;

                for (var prop in this.$options.props) {
                    if (this[prop] && this.exclude.indexOf(prop) === -1) {
                        el.attr(prop, this[prop]);
                    }
                }

                if (!this.id) {
                    el.removeAttr('id');
                }

                if (this.width && !this.height) {
                    el.removeAttr('height');
                }

                if (this.height && !this.width) {
                    el.removeAttr('width');
                }

                return el;
            }

        }

    };

};
