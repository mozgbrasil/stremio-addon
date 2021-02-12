#!/bin/bash

# https://vaneyckt.io/posts/safer_bash_scripts_with_set_euxo_pipefail/
# set -Eeuxo pipefail
# set -Eeu
# set -o pipefail # trace ERR through pipes
# set -o errtrace # trace ERR through 'time command' and other functions
# function error {
#     local JOB="$0"      # job name
#     local LASTLINE="$1" # line of error occurrence
#     local LASTERR="$2"  # error code
#     echo "ERROR in ${JOB} : line ${LASTLINE} with exit code ${LASTERR}"
#     exit 1
# }
# trap 'error ${LINENO} ${?}' ERR

#

function setVars() {

    SOURCE_DIR=$(
        cd "$(dirname "${BASH_SOURCE[0]}")"
        pwd -P
    )
    # echo "SOURCE_DIR: $SOURCE_DIR"
    # echo "SHELL: $SHELL"
    # echo "TERM: $TERM"

    # defaults

    BLACK='⬛ '  # Black
    RED='🟥 '    # Red
    GREEN='🟩 '  # Green
    YELLOW='🟨 ' # Yellow
    BLUE='🟦 '   # Blue
    PURPLE='🟪 ' # Purple
    BROWN='🟫 '  # Brown
    WHITE='⬜ '  # White

    RESETCOLOR='' # Text Reset

    NOW_2_FILE=$(date +%Y-%m-%d_%H-%M-%S)
    DATE_EN_US=$(date '+%Y-%m-%d %H:%M:%S')
    DATE_PT_BR=$(date '+%d/%m/%Y %H:%M:%S')

}

setVars

#

function dotenv() {
    set -a
    [ -f "$1" ] && . "$1"
    set +a
}

# https://stackoverflow.com/questions/1007538/check-if-a-function-exists-from-a-bash-script?lq=1
function function_exists() {
    local FUNCTION_NAME=$1
    [ -z "$FUNCTION_NAME" ] && return 1
    declare -F "$FUNCTION_NAME" >/dev/null 2>&1
    return $?
}

# https://unix.stackexchange.com/questions/212183/how-do-i-check-if-a-variable-exists-in-an-if-statement
# has_declare {                  # check if variable is set at all
#   local "$@"                     # inject 'name' argument in local scope
#   declare &>/dev/null -p "$name" # return 0 when var is present
# }

function echio() {
    local MESSAGE="$1"
    local COLOR=${2:-$GREEN}
    echo -e "${COLOR}${MESSAGE}${RESETCOLOR}"
}

function fnc_before() {
    local _FUNCNAME="$1 {"
    echo -e "${BLUE}${_FUNCNAME}${RESETCOLOR}"
}

function fnc_after() {
    echo -e "${BLUE}}${RESETCOLOR}"
}

function cd_source_dir() {

    fnc_before ${FUNCNAME[0]}

    pwd && cd $SOURCE_DIR/ && pwd

    fnc_after

}

# cd_source_dir

#

# bash shell.sh hello
function hello() {
    fnc_before ${FUNCNAME[0]}
    cat <<-_EOF_
https://github.com/mozgbrasil
_EOF_
    echio 'Hello World'
    fnc_after
}

# bash -x shell.sh postinstall
function beamup_set_secrets() {
    fnc_before ${FUNCNAME[0]}
    #

    # beamup secrets <secret-name> <secret-value>
    cat <<-_EOF_
https://github.com/mozgbrasil
_EOF_
    echio 'Hello World'

    (cat .env |
        sed -E '/^\s*#.*/d' |
        tr '\n' '\000' |
        sed -z -E 's/^([^=]+)=(.*)/\1\x0\2/g' |
        xargs -0 -n2 bash -c 'printf "beamup secrets %s %q \n" "${@}"' /dev/null)

    while read -r line; do echo "$line"; done < <(egrep -v "(^#|^\s|^$)" .env)

    echo $(grep -v '^#' .env | sed -E 's/(.*)=.*/\1/' | xargs)

    #
    fnc_after
}

#

METHOD=${1}

if function_exists $METHOD; then
    $@
else
    echio "$METHOD" "$YELLOW"
fi
