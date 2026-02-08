#!/bin/bash
# Bash completion script for mochi CLI

_mochi_complete() {
    local cur prev words cword
    _init_completion || return

    local commands="card deck template due help"
    local card_actions="list get create update delete add-attachment delete-attachment"
    local deck_actions="list get create update delete"
    local template_actions="list get create"
    local due_actions="list list-by-deck"
    
    local global_opts="--api-key --help -h --version -v"
    local card_opts="--deck-id --limit --bookmark --all --content --template-id --archived --review-reverse --pos --manual-tags --fields --file --filename"
    local deck_opts="--bookmark --all --name --parent-id --sort --archived --trashed --sort-by --cards-view --show-sides --sort-by-direction --review-reverse"
    local template_opts="--bookmark --all --content --pos --fields --style --options"
    local due_opts="--date --deck-id"

    # First level - commands
    if [[ $cword -eq 1 ]]; then
        COMPREPLY=( $(compgen -W "${commands} ${global_opts}" -- "$cur") )
        return 0
    fi

    local command="${words[1]}"
    local action=""
    
    # Second level - actions
    if [[ $cword -eq 2 ]]; then
        case "$command" in
            card)
                COMPREPLY=( $(compgen -W "${card_actions} ${global_opts}" -- "$cur") )
                return 0
                ;;
            deck)
                COMPREPLY=( $(compgen -W "${deck_actions} ${global_opts}" -- "$cur") )
                return 0
                ;;
            template)
                COMPREPLY=( $(compgen -W "${template_actions} ${global_opts}" -- "$cur") )
                return 0
                ;;
            due)
                COMPREPLY=( $(compgen -W "${due_actions} ${global_opts}" -- "$cur") )
                return 0
                ;;
        esac
    fi
    
    # Third level - options based on command+action
    action="${words[2]}"
    case "$command" in
        card)
            case "$action" in
                list)
                    COMPREPLY=( $(compgen -W "--deck-id --limit --bookmark --all ${global_opts}" -- "$cur") )
                    ;;
                get|delete)
                    COMPREPLY=( $(compgen -W "${global_opts}" -- "$cur") )
                    ;;
                create)
                    COMPREPLY=( $(compgen -W "--content --deck-id --template-id --archived --review-reverse --pos --manual-tags --fields ${global_opts}" -- "$cur") )
                    ;;
                update)
                    COMPREPLY=( $(compgen -W "--content --deck-id --template-id --archived --trashed --review-reverse --pos --manual-tags --fields ${global_opts}" -- "$cur") )
                    ;;
                add-attachment)
                    COMPREPLY=( $(compgen -W "--file --filename ${global_opts}" -- "$cur") )
                    _filedir
                    ;;
                delete-attachment)
                    COMPREPLY=( $(compgen -W "--filename ${global_opts}" -- "$cur") )
                    ;;
            esac
            ;;
        deck)
            case "$action" in
                list)
                    COMPREPLY=( $(compgen -W "--bookmark --all ${global_opts}" -- "$cur") )
                    ;;
                get|delete)
                    COMPREPLY=( $(compgen -W "${global_opts}" -- "$cur") )
                    ;;
                create|update)
                    COMPREPLY=( $(compgen -W "${deck_opts} ${global_opts}" -- "$cur") )
                    ;;
            esac
            ;;
        template)
            case "$action" in
                list)
                    COMPREPLY=( $(compgen -W "--bookmark --all ${global_opts}" -- "$cur") )
                    ;;
                get)
                    COMPREPLY=( $(compgen -W "${global_opts}" -- "$cur") )
                    ;;
                create)
                    COMPREPLY=( $(compgen -W "${template_opts} ${global_opts}" -- "$cur") )
                    ;;
            esac
            ;;
        due)
            case "$action" in
                list)
                    COMPREPLY=( $(compgen -W "--date ${global_opts}" -- "$cur") )
                    ;;
                list-by-deck)
                    COMPREPLY=( $(compgen -W "--deck-id --date ${global_opts}" -- "$cur") )
                    ;;
            esac
            ;;
    esac
    
    # Complete file paths for --file argument
    if [[ "$prev" == "--file" ]]; then
        _filedir
    fi
}

complete -F _mochi_complete mochi
