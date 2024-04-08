export type HtmlAttribute = "accept" | "accept-charset" | "accesskey" | "action" | "align" | "alt" | `aria-${string}` | "async" | "autocomplete"
    | "autofocus" | "autoplay" | "bgcolor" | "border" | "charset" | "checked" | "cite" | "class" | "color" | "cols" | "colspan" | "content"
    | "contenteditable" | "controls" | "coords" | "data" | `data-${string}` | "datetime" | "default" | "defer" | "dir" | "dirname" | "disabled"
    | "download" | "draggable" | "enctype" | "enterkeyhint" | "for" | "form" | "formaction" | "headers" | "height" | "hidden" | "high" | "href"
    | "hreflang" | "http-equiv" | "id" | "inert" | "inputmode" | "ismap" | "kind" | "label" | "lang" | "list" | "longdesc" | "loop" | "low" | "max"
    | "maxlength" | "media" | "method" | "min" | "minlength" | "multiple" | "muted" | "name" | "novalidate" | "onabort" | "onafterprint" | "onbeforeprint"
    | "onbeforeunload" | "onblur" | "oncanplay" | "oncanplaythrough" | "onchange" | "onclick" | "oncontextmenu" | "oncopy" | "oncuechange" | "oncut"
    | "ondblclick" | "ondrag" | "ondragend" | "ondragenter" | "ondragleave" | "ondragover" | "ondragstart" | "ondrop" | "ondurationchange" | "onemptied"
    | "onended" | "onerror" | "onfocus" | "onhashchange" | "oninput" | "oninvalid" | "onkeydown" | "onkeypress" | "onkeyup" | "onload" | "onloadeddata"
    | "onloadedmetadata" | "onloadstart" | "onmousedown" | "onmousemove" | "onmouseout" | "onmouseover" | "onmouseup" | "onmousewheel" | "onoffline"
    | "ononline" | "onpagehide" | "onpageshow" | "onpaste" | "onpause" | "onplay" | "onplaying" | "onpopstate" | "onprogress" | "onratechange"
    | "onreset" | "onresize" | "onscroll" | "onsearch" | "onseeked" | "onseeking" | "onselect" | "onstalled" | "onstorage" | "onsubmit" | "onsuspend"
    | "ontimeupdate" | "ontoggle" | "onunload" | "onvolumechange" | "onwaiting" | "onwheel" | "open" | "optimum" | "pattern" | "placeholder"
    | "popover" | "popovertarget" | "popovertargetaction" | "poster" | "preload" | "readonly" | "rel" | "required" | "reversed" | "rows" | "rowspan"
    | "sandbox" | "scope" | "selected" | "shape" | "size" | "sizes" | "span" | "spellcheck" | "src" | "srcdoc" | "srclang" | "srcset" | "start"
    | "step" | "style" | "tabindex" | "target" | "title" | "translate" | "type" | "usemap" | "value" | "width" | "wrap";

export type TextAreaWrap = "soft" | "hard";

export type EvaluateFunction<R, VarArgs extends any[] = []> = (element: HTMLElement & { [key: string]: any }, ...args: VarArgs) => R;