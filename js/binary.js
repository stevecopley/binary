const ram          = document.getElementById( 'ram' );
const binary       = document.getElementById( 'binary' );
const decimal      = document.getElementById( 'decimal' );
const hexadecimal  = document.getElementById( 'hexadecimal' );
const character    = document.getElementById( 'character' );
const assembly     = document.getElementById( 'assembly' );
const colour       = document.getElementById( 'colour' );

const ramContainer = document.getElementById( 'ram-stick' );
const ramOverlay   = document.getElementById( 'ram-overlay' );

const bitContainer = document.getElementById( 'bits' );
const binContainer = document.getElementById( 'bin-value' );
const decContainer = document.getElementById( 'dec-value' );
const hexContainer = document.getElementById( 'hex-value' );

const char         = document.getElementById( 'char' );
const charInfo     = document.getElementById( 'char-info' );
const charType     = document.getElementById( 'char-type' );
const charBlock    = document.getElementById( 'char-block' );

const asmCode      = document.getElementById( 'asm-instruction' );
const asmType      = document.getElementById( 'asm-type' );

const alpha        = document.getElementById( 'alpha' );
const hexHash      = document.getElementById( 'hex-hash' );
const colType      = document.getElementById( 'colour-type' );
const colDepth     = document.getElementById( 'colour-depth' );
const redColour    = document.getElementById( 'red-colour' );
const redDec       = document.getElementById( 'red-value' );
const redCode      = document.getElementById( 'red-code' );
const grnColour    = document.getElementById( 'green-colour' );
const grnDec       = document.getElementById( 'green-value' );
const grnCode      = document.getElementById( 'green-code' );
const bluColour    = document.getElementById( 'blue-colour' );
const bluDec       = document.getElementById( 'blue-value' );
const bluCode      = document.getElementById( 'blue-code' );
const alpColour    = document.getElementById( 'alpha-colour' );
const alpDec       = document.getElementById( 'alpha-value' );
const alpCode      = document.getElementById( 'alpha-code' );
const finalColour  = document.getElementById( 'final-colour' );

const bitInput     = document.getElementById( 'bit-input' );
const ramToggle    = document.getElementById( 'ram-toggle' );
const binToggle    = document.getElementById( 'bin-toggle' );
const decToggle    = document.getElementById( 'dec-toggle' );
const hexToggle    = document.getElementById( 'hex-toggle' );
const charToggle   = document.getElementById( 'char-toggle' );
const colourToggle = document.getElementById( 'colour-toggle' );
const asmToggle    = document.getElementById( 'assembly-toggle' );
const signedToggle = document.getElementById( 'signed-toggle' );
const powerToggle  = document.getElementById( 'power-toggle' );
const columnToggle = document.getElementById( 'column-toggle' );


let bitCount = 8;

let options = {
    signed:      { active: false, toggle: signedToggle, block: null },
    
    ram:         { active: true,  toggle: ramToggle,    block: ram },

    binary:      { active: true,  toggle: binToggle,    block: binary },
    decimal:     { active: true,  toggle: decToggle,    block: decimal },
    hexadecimal: { active: false, toggle: hexToggle,    block: hexadecimal },

    colour:      { active: false, toggle: colourToggle, block: colour },
    character:   { active: false, toggle: charToggle,   block: character },
    assembly:    { active: false, toggle: asmToggle,    block: assembly },

    powers:      { active: false, toggle: powerToggle,  block: null },
    columns:     { active: false, toggle: columnToggle, block: null }
};

let byteCount;
let maxValue;
let maxSignedValue;

let bits = [];
let ramBits = [];
let binDigits = [];
let hexDigits = [];
let decValue = [];

bitInput.addEventListener( 'change', () => {
    bitCount = Math.max( bitInput.value, 1 );
    bitCount = Math.min( bitCount, 512 );
    setup();
} );


//----------------------------------------------------
function setup() {
    byteCount      = Math.ceil( bitCount / 8 );
    maxValue       = (BigInt( 2 ) ** BigInt( bitCount )) - 1n;
    maxSignedValue = (BigInt( 2 ) ** BigInt( bitCount - 1 )) - 1n;

    setupRAM();

    bits = setupNumber( bitContainer, 2, true, false );

    binDigits = setupNumber( binContainer, 2 );
    hexDigits = setupNumber( hexContainer, 16 );
    decValue  = setupNumber( decContainer, 10, false, false );

    setupColours();
    setupAssembly();

    // Setup controls
    bitInput.value = bitCount;

    // Disable options as required
    if( !colourInfo[bitCount] )   options.colour.active = false;
    if( !assemblyInfo[bitCount] ) options.assembly.active = false;
    if( bitCount > 24 )           options.character.active = false;

    update( 0 );
}


//----------------------------------------------------
function setupRAM() {
    ramOverlay.innerHTML = '';
    ramBits = [];
    const bitsToShow = Math.ceil( bitCount / 128 ) * 128
    let ramBlock;

    for (let i = 0; i < bitsToShow; i++) {
        if( i % 128 == 0 ) {
            ramBlock = document.createElement( 'div' );
            ramBlock.classList.add( 'ram-block' );
            ramOverlay.prepend( ramBlock );
        }
        const ramBit = document.createElement( 'div' );
        ramBit.classList.add( 'ram-bit' );
        ramBlock.append( ramBit );

        if( i < bitCount ) {
            ramBits.push( ramBit );
        }
    }
}


//----------------------------------------------------
function setupNumber( container, base, clickable=false, labels=true ) {
    container.innerHTML = '';
    let digits = [];

    // Bits per digit for the given base, base2->1, base16->4, base8->3, etc.
    let bitsPerDigit = Math.log2( base );
    // Find the number of digits per byte base2->8, base16->2, base8->3, etc.
    let digitsPerByte = Math.ceil( 8 / bitsPerDigit );
    let digitsPerNibble = digitsPerByte / 2;
    // Total digits to view
    let visibleDigits = byteCount * digitsPerByte;
    // Active 'live' digits
    let liveDigits = Math.ceil( bitCount / bitsPerDigit );

    // Overide for decimal!
    if( base == 10 ) {
        digitsPerByte = 1;
        digitsPerNibble = 1;
        visibleDigits = 1;
        liveDigits = 1;
    }

    let byte = null;
    let nibble = null;
        
    for( let i = 0; i < visibleDigits; i++ ) {
        // Need a new byte?
        if( i % digitsPerByte == 0 ) {
            byte = document.createElement( 'div' );
            byte.classList.add( 'byte' );
            byte.classList.add( 'group' );
        }
        // Need a new nibble?
        if( i % digitsPerNibble == 0 ) {
            nibble = document.createElement( 'div' );
            nibble.classList.add( 'nibble' );
        }

        // Create the bit
        const digitContainer = document.createElement( 'div' );
        digitContainer.classList.add( 'digit' );
        const digit = document.createElement( 'div' );
        digit.innerHTML = '0';
        digit.classList.add( 'digitvalue' );
        digitContainer.append( digit );
        nibble.prepend( digitContainer );
        digits.push( digit );
        
        // Is this a 'live' bit?
        if( clickable && i < liveDigits ) {
            digit.onclick = toggleBit;
        }
        // Is this padding digit?
        if( i >= liveDigits ) {
            digitContainer.classList.add( 'padding' );
        }

        if( labels ) {
            const digitValueLabel = document.createElement( 'label' );
            const digitValueDiv   = document.createElement( 'div' );
            const digitPowerLabel = document.createElement( 'label' );
            const digitExponent   = document.createElement( 'sup' );

            digitValueDiv.innerText = formatNumber( Math.pow( base, i ) );
            digitValueLabel.append( digitValueDiv );
            digitValueLabel.classList.add( 'colhead' );  
            if( options.columns.active ) digitValueLabel.classList.add( 'visible' );    

            digitExponent.innerHTML = i;
            digitPowerLabel.innerText = base;
            digitPowerLabel.append( digitExponent );
            digitPowerLabel.classList.add( 'power' );
            if( options.powers.active ) digitPowerLabel.classList.add( 'visible' );    
            
            digitContainer.prepend( digitValueLabel );
            digitContainer.prepend( digitPowerLabel );
        }

        // Is nibble full, or last bit?
        if( i % digitsPerNibble == digitsPerNibble - 1 ) {
            byte.prepend( nibble );
        }
        // Is byte full, or last bit?
        if( i % digitsPerByte == digitsPerByte - 1 ) {
            container.prepend( byte );
        }
    }

    container.dataset.units = visibleDigits;

    return digits;
}



//----------------------------------------------------
function setupAssembly() {
    BitMode = 0;
    ShowInstructionHex = true;
    ShowInstructionPos = false;

    // Only show for valid instruction sets
    if( assemblyInfo[bitCount] ) {
        BitMode = assemblyInfo[bitCount].disasmMode;
        asmType.innerHTML = assemblyInfo[bitCount].name;
    }
}


//----------------------------------------------------
function setupColours() {
    // Only show for valid colour depths
    if( colourInfo[bitCount] ) {
        alpha.style.display   = colourInfo[bitCount].bits.alpha ? 'flex' : 'none';
        alpCode.style.display = colourInfo[bitCount].bits.alpha ? 'inline' : 'none';
        hexHash.style.display = colourInfo[bitCount].code.base == 16 ? 'inline' : 'none';
        colType.innerHTML     = colourInfo[bitCount].name;
        colDepth.innerHTML    = bitCount;
    }
    else {
        colour.classList.remove( 'visible' );
        colourToggle.checked = false;
    }
}


//----------------------------------------------------
function update( newValue=null ) {
    const value = newValue == null ? getValue() : newValue;

    updateRAM( value );

    updateNumber( bits,       2, value );
    updateNumber( binDigits,  2, value );
    updateNumber( hexDigits, 16, value );
    updateNumber( decValue,  10, value );

    updateChar( value );
    if( colourInfo[bitCount] )   updateColours( value );
    if( assemblyInfo[bitCount] ) updateAssembly( value );

    // console.log( options );
    for( key in options ) {
        if( options[key].active ) {
            options[key].toggle.checked = true;
            if( options[key].block ) options[key].block.classList.add( 'visible' );
        }
        else {
            options[key].toggle.checked = false;
            if( options[key].block ) options[key].block.classList.remove( 'visible' );
        }
    };
}


//----------------------------------------------------
function getValue() {
    let value = 0n;
    let bitValue = 1n;

    bits.forEach( bit => {
        value += bit.classList.contains( 'on' ) ? bitValue : 0n;
        bitValue *= 2n;
    });

    // console.log( 'Value: ' + value );
    return value;
}


//----------------------------------------------------
function updateRAM( value ) {
    const valueBits = numberToBin( value, bitCount );

    for( let i = 0; i < ramBits.length; i++ ) {
        const ramBit = ramBits[i];
        if( valueBits[bitCount-i-1] == '1' ) {
            ramBits[i].classList.add( 'on' );
        }
        else {
            ramBits[i].classList.remove( 'on' );
        }
    }
}


    //----------------------------------------------------
function updateNumber( digits, base, value ) {
    if( base == 10 ) {
        if( options.signed.active && value > maxSignedValue ) {
            value -= (maxValue + 1n);
        }
        digits[0].innerHTML = formatNumber( value );
        return;
    }

    const digitValues = value.toString( base ).toUpperCase();
    // console.log( 'Digits: ' + digitValues );
    const leastSigFirst = digitValues.split( '' ).reverse();
    // console.log( 'LS First: ' + leastSigFirst );

    let digitIndex = 0;

    // Work thru digits from LS to MS
    digits.forEach( digit => {
        const digitValue = digitIndex < leastSigFirst.length ? leastSigFirst[digitIndex++] : 0;
        digit.innerHTML = digitValue;
        if( digitValue != '0' ) {
            digit.classList.add( 'on' );
        }
        else {
            digit.classList.remove( 'on' );
        }
    } );
}


//----------------------------------------------------
function updateChar( value ) {
    const SPACE = '\u00A0';
    charType.innerHTML = value < 128 ? 'ASCII' : 'UniCode';
    let block = 'Unknown UniCode';

    for (let i = 0; i < unicode.length; i++) {
        const unicodeBlock = unicode[i];

        if( value >= unicodeBlock.min && value <= unicodeBlock.max ) {
            block = unicodeBlock.name;
            break;
        }
    }

    charBlock.innerHTML = block;

    if( controlChars[value] ) {
        char.innerHTML = SPACE + controlChars[value].abbr + SPACE;
        char.classList.add( 'control' );
        charInfo.innerHTML = `(${controlChars[value].desc})`;
    }
    else {
        try {
            const character = String.fromCodePoint( Number( value ) );
            char.innerHTML = SPACE + character + SPACE;
            char.classList.remove( 'control' );
            charInfo.innerHTML = '';
            charInfo.classList.remove( 'invalid' );
        }
        catch( e ) {
            char.innerHTML = SPACE;
            charInfo.innerHTML = '(invalid UniCode)';
            charInfo.classList.add( 'invalid' );
        }
    }
}


//----------------------------------------------------
function updateAssembly( value ) {
    const hex = numberToHex( value );
    LoadBinCode( hex );

    let asm = LDisassemble();
    // console.log( asm );

    let asmLines = asm.split( '\r\n' );
    asmLines.length--;
    // console.log( asmLines );

    let instructions = '';
    asmLines.forEach( line => {
        instructions += '<p><span class="ophex">';
        instructions += line.replace( '                ', '</span> <span class="opcode">' ).replace( /  /g, ' ' );
        instructions += '</span></p>';
    } );
    // console.log( instructions );
    
    asmCode.innerHTML = instructions;
}



//----------------------------------------------------
function updateColours( value ) {
    const colInfo = colourInfo[bitCount];
    const hasAlpha = colInfo.bits.alpha;
    const digits   = colInfo.code.digits;

    const binString = numberToBin( value, bitCount );
    const redBin = binString.substring( 0, colInfo.bits.red );
    const grnBin = binString.substring( colInfo.bits.red, colInfo.bits.red + colInfo.bits.green );
    const bluBin = binString.substring( colInfo.bits.red + colInfo.bits.green, 
                                        colInfo.bits.red + colInfo.bits.green + colInfo.bits.blue );
    const alpBin = hasAlpha ? binString.substring( colInfo.bits.red + colInfo.bits.green + colInfo.bits.blue, 
                                                   colInfo.bits.red + colInfo.bits.green + colInfo.bits.blue + colInfo.bits.alpha ) : '11111111';

    const redValue = parseInt( redBin, 2 );
    const grnValue = parseInt( grnBin, 2 );
    const bluValue = parseInt( bluBin, 2 );
    const alpValue = parseInt( alpBin, 2 );

    const redLevel = redValue / (Math.pow( 2, colInfo.bits.red )   - 1);
    const grnLevel = grnValue / (Math.pow( 2, colInfo.bits.green ) - 1);
    const bluLevel = bluValue / (Math.pow( 2, colInfo.bits.blue )  - 1);
    const alpLevel = hasAlpha ? alpValue / (Math.pow( 2, colInfo.bits.alpha ) - 1) : 1.0;

    const redCodeValue = colInfo.code.base == 2 ? redBin : numberToHex( redValue, 2 );
    const grnCodeValue = colInfo.code.base == 2 ? grnBin : numberToHex( grnValue, 2 );
    const bluCodeValue = colInfo.code.base == 2 ? bluBin : numberToHex( bluValue, 2 );
    const alpCodeValue = hasAlpha ? (colInfo.code.base == 2 ? alpBin : numberToHex( alpValue, 2 )) : '';

    redColour.style.backgroundImage = generateFill( '#ff0000', redLevel );
    grnColour.style.backgroundImage = generateFill( '#00ff00', grnLevel );
    bluColour.style.backgroundImage = generateFill( '#0000ff', bluLevel );
    alpColour.style.backgroundImage = generateFill( '#fff',    alpLevel );

    const finalColourRGBA = `rgba(${redLevel * 255}, ${grnLevel * 255}, ${bluLevel * 255}, ${alpLevel})`;    
    finalColour.style.backgroundColor = finalColourRGBA;

    redDec.innerHTML = redValue;
    grnDec.innerHTML = grnValue;
    bluDec.innerHTML = bluValue;
    alpDec.innerHTML = alpValue;
    
    redCode.innerHTML = redCodeValue;
    grnCode.innerHTML = grnCodeValue;
    bluCode.innerHTML = bluCodeValue;
    alpCode.innerHTML = alpCodeValue;
}


//----------------------------------------------------
function hexToRBG( hex ) {
    redHex = hex.substring( 0, 2 );
    grnHex = hex.substring( 2, 4 );
    bluHex = hex.substring( 4, 6 );
    alpHex = hex.length == 8 ? hex.substring( 6, 8 ) : 'FF';

    redValue = parseInt( redHex, 16 );
    grnValue = parseInt( grnHex, 16 );
    bluValue = parseInt( bluHex, 16 );
    alpValue = parseInt( alpHex, 16 );

    return { r: redValue, g: grnValue, b: bluValue, a: alpValue };
}


//----------------------------------------------------
function generateFill( colour, value ) {
    const percent = Math.floor( value * 100 );
    return `linear-gradient(to top, ${colour} 0%, ${colour} ${percent}%, #000 ${percent}%, #000 100%)`;
}


//----------------------------------------------------
function formatNumber( num ) {
    return num.toString().replace( /(\d)(?=(\d{3})+(?!\d))/g, '$1,' );
}


//----------------------------------------------------
function numberToHex( num, digits ) {
    return num.toString( 16 ).toUpperCase().padStart( digits, '0' );
}

function numberToBin( num, digits ) {
    return num.toString( 2 ).toUpperCase().padStart( digits, '0' );
}


//----------------------------------------------------
function toggleBit() {
    this.classList.toggle( 'on' );
    update();
}


//----------------------------------------------------
function incrementValue() {
    let newValue = getValue() + 1n;
    if( newValue > maxValue ) {
        newValue = options.signed.active ? 0n : maxValue;
    }
    update( newValue );
}

function decrementValue() {
    let newValue = getValue() - 1n;
    if( newValue < 0n ) {
        newValue = options.signed.active ? maxValue : 0n;
    }
    update( newValue );
}


//----------------------------------------------------
function maximumValue() {
    update( options.signed.active ? maxSignedValue : maxValue );
}

function minimumValue() {
    update( options.signed.active ? maxSignedValue + 1n : 0n );
}

function randomValue() {
    const binString = Array( bitCount )
        .fill()
        .map( () => Math.round( Math.random() ).toString( 2 ) )
        .join( '' );

    const randomValue = BigInt( `0b${binString}` );

    console.log( binString );
    console.log( randomValue );
    update( randomValue );
}


//----------------------------------------------------
function toggleRAM() {
    options.ram.active = !options.ram.active;
    update();
}

function toggleBin() {
    options.binary.active = !options.binary.active;
    update();
}

function toggleDec() {
    options.decimal.active = !options.decimal.active;
    update();
}

function toggleHex() {
    options.hexadecimal.active = !options.hexadecimal.active;
    update();
}

function toggleChar() {
    if( bitCount <= 24 && charToggle.checked ) {
        options.character.active = true;
    }
    else {
        options.character.active = false;
    }
    update();
}

function toggleColour() {
    // Valid colour system?
    if( colourInfo[bitCount] && colourToggle.checked  ) {
        options.colour.active = true;
        options.signed.active = false; // Doesn't work with signed values
    }
    else {
        options.colour.active = false;
    }
    update();
}

function toggleAssembly() {
    // Valid coding system?
    if( assemblyInfo[bitCount] && asmToggle.checked  ) {
        options.assembly.active = true;
        options.signed.active = false; // Doesn't work with signed values
    }
    else {
        options.assembly.active = false;
    }
    update();
}


//----------------------------------------------------
function toggleSigned() {
    options.signed.active = !options.signed.active;

    if( options.signed.active ) {
        // Having colourm char and assembly with signed ints doesn't make sense
        options.character.active = false;
        options.colour.active = false;
        options.assembly.active = false;
        // And need to see the decimal value for it to make sense
        options.binary.active = true;
        options.decimal.active = true;
    }

    update();
}


//----------------------------------------------------
function togglePowers() {
    options.powers.active = !options.powers.active;

    const powers = document.getElementsByClassName( 'power' );
    [...powers].forEach( power => {
        power.classList.toggle( 'visible' );
    });

    update();
}


//----------------------------------------------------
function toggleColHeadings() {
    options.columns.active = !options.columns.active;

    const headings = document.getElementsByClassName( 'colhead' );
    [...headings].forEach( heading => {
        heading.classList.toggle( 'visible' );
    });

    update();
}

