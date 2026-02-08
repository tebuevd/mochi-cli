#compdef mochi
# Zsh completion script for mochi CLI

_mochi() {
    local curcontext="$curcontext" state line
    typeset -A opt_args

    local -a commands
    commands=(
        'card:Manage cards'
        'deck:Manage decks'
        'template:Manage templates'
        'due:Query due cards'
        'help:Show help'
    )

    local -a card_actions
    card_actions=(
        'list:List cards'
        'get:Get a card'
        'create:Create a card'
        'update:Update a card'
        'delete:Delete a card'
        'add-attachment:Add attachment'
        'delete-attachment:Delete attachment'
    )

    local -a deck_actions
    deck_actions=(
        'list:List decks'
        'get:Get a deck'
        'create:Create a deck'
        'update:Update a deck'
        'delete:Delete a deck'
    )

    local -a template_actions
    template_actions=(
        'list:List templates'
        'get:Get a template'
        'create:Create a template'
    )

    local -a due_actions
    due_actions=(
        'list:List all due cards'
        'list-by-deck:List due cards for a deck'
    )

    local -a global_opts
    global_opts=(
        '(-h --help)'{-h,--help}'[Show help message]'
        '(-v --version)'{-v,--version}'[Show version]'
        '--api-key[API key for authentication]:api key:'
    )

    _arguments -C \
        '1: :->command' \
        '2: :->action' \
        '*:: :->args' \
        $global_opts

    case "$state" in
        command)
            _describe -t commands 'commands' commands
            ;;
        action)
            case "$line[1]" in
                card)
                    _describe -t actions 'card actions' card_actions
                    ;;
                deck)
                    _describe -t actions 'deck actions' deck_actions
                    ;;
                template)
                    _describe -t actions 'template actions' template_actions
                    ;;
                due)
                    _describe -t actions 'due actions' due_actions
                    ;;
            esac
            ;;
        args)
            case "$line[1]" in
                card)
                    case "$line[2]" in
                        list)
                            _arguments \
                                '--deck-id[Filter by deck ID]:deck id:' \
                                '--limit[Number of cards per page]:limit:' \
                                '--bookmark[Pagination bookmark]:bookmark:' \
                                '--all[Stream all cards]'
                            ;;
                        get|delete)
                            _arguments ':card id:'
                            ;;
                        create)
                            _arguments \
                                '--content[Card content (markdown)]:content:' \
                                '--deck-id[Deck ID]:deck id:' \
                                '--template-id[Template ID]:template id:' \
                                '--archived[Mark as archived]' \
                                '--review-reverse[Enable reverse review]' \
                                '--pos[Position for sorting]:position:' \
                                '--manual-tags[Comma-separated tags]:tags:' \
                                '--fields[Fields as JSON]:fields:'
                            ;;
                        update)
                            _arguments \
                                ':card id:' \
                                '--content[New content]:content:' \
                                '--deck-id[New deck ID]:deck id:' \
                                '--template-id[New template ID]:template id:' \
                                '--archived[Mark as archived]' \
                                '--trashed[Trash timestamp]:timestamp:' \
                                '--review-reverse[Enable reverse review]' \
                                '--pos[New position]:position:' \
                                '--manual-tags[Comma-separated tags]:tags:' \
                                '--fields[Fields as JSON]:fields:'
                            ;;
                        add-attachment)
                            _arguments \
                                ':card id:' \
                                '--file[File path]:file:_files' \
                                '--filename[Custom filename]:filename:'
                            ;;
                        delete-attachment)
                            _arguments \
                                ':card id:' \
                                '--filename[Filename to delete]:filename:'
                            ;;
                    esac
                    ;;
                deck)
                    case "$line[2]" in
                        list)
                            _arguments \
                                '--bookmark[Pagination bookmark]:bookmark:' \
                                '--all[Stream all decks]'
                            ;;
                        get|delete)
                            _arguments ':deck id:'
                            ;;
                        create)
                            _arguments \
                                '--name[Deck name]:name:' \
                                '--parent-id[Parent deck ID]:parent id:' \
                                '--sort[Sort order number]:sort:' \
                                '--archived[Mark as archived]' \
                                '--trashed[Trash timestamp]:timestamp:' \
                                '--sort-by[Sort method]:sort by:(none lexigraphically lexicographically created-at updated-at retention-rate-asc interval-length)' \
                                '--cards-view[View mode]:view mode:(list grid note column)' \
                                '--show-sides[Show all card sides]' \
                                '--sort-by-direction[Reverse sort order]' \
                                '--review-reverse[Enable reverse review]'
                            ;;
                        update)
                            _arguments \
                                ':deck id:' \
                                '--name[Deck name]:name:' \
                                '--parent-id[Parent deck ID]:parent id:' \
                                '--sort[Sort order number]:sort:' \
                                '--archived[Mark as archived]' \
                                '--trashed[Trash timestamp]:timestamp:' \
                                '--sort-by[Sort method]:sort by:(none lexigraphically lexicographically created-at updated-at retention-rate-asc interval-length)' \
                                '--cards-view[View mode]:view mode:(list grid note column)' \
                                '--show-sides[Show all card sides]' \
                                '--sort-by-direction[Reverse sort order]' \
                                '--review-reverse[Enable reverse review]'
                            ;;
                    esac
                    ;;
                template)
                    case "$line[2]" in
                        list)
                            _arguments \
                                '--bookmark[Pagination bookmark]:bookmark:' \
                                '--all[Stream all templates]'
                            ;;
                        get)
                            _arguments ':template id:'
                            ;;
                        create)
                            _arguments \
                                '--name[Template name]:name:' \
                                '--content[Template content]:content:' \
                                '--pos[Position for sorting]:position:' \
                                '--fields[Fields definition as JSON]:fields:' \
                                '--style[Style options as JSON]:style:' \
                                '--options[Template options as JSON]:options:'
                            ;;
                    esac
                    ;;
                due)
                    case "$line[2]" in
                        list)
                            _arguments \
                                '--date[Due date (ISO 8601)]:date:'
                            ;;
                        list-by-deck)
                            _arguments \
                                '--deck-id[Deck ID]:deck id:' \
                                '--date[Due date (ISO 8601)]:date:'
                            ;;
                    esac
                    ;;
            esac
            ;;
    esac
}

_mochi "$@"
