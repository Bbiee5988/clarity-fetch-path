;; FetchPath - Enhanced Pet Management System

;; Constants
(define-constant contract-owner tx-sender)
(define-constant err-not-owner (err u100))
(define-constant err-pet-exists (err u101))
(define-constant err-pet-not-found (err u102))
(define-constant err-unauthorized (err u103))
(define-constant err-invalid-verification (err u104))
(define-constant err-invalid-input (err u105))
(define-constant err-future-date (err u106))

;; [Previous data variables remain unchanged...]

;; Private Functions
(define-private (is-pet-owner (pet-id uint) (user principal))
    (let ((pet-info (unwrap! (map-get? pets {pet-id: pet-id}) false)))
        (is-eq (get owner pet-info) user)
    )
)

(define-private (validate-date (date uint))
    (let ((current-height block-height)
          (max-future-blocks u525600))
        (and 
            (>= date current-height)
            (< date (+ current-height max-future-blocks))
        )
    )
)

;; New Functions
(define-public (register-pet 
    (name (string-ascii 50))
    (species (string-ascii 20))
    (birth-date uint))
    (let ((new-id (+ (var-get last-pet-id) u1)))
        (begin
            (asserts! (> (len name) u0) err-invalid-input)
            (asserts! (> (len species) u0) err-invalid-input)
            (asserts! (validate-date birth-date) err-future-date)
            (asserts! (is-none (map-get? pets {pet-id: new-id})) err-pet-exists)
            
            (var-set last-pet-id new-id)
            (ok (map-set pets
                {pet-id: new-id}
                {
                    owner: tx-sender,
                    name: name,
                    species: species,
                    birth-date: birth-date,
                    emergency-contact: none
                }
            ))
        )
    )
)

;; [Previous functions remain unchanged...]

;; Enhanced Read Only Functions
(define-read-only (get-pet-records (pet-id uint) (start uint) (end uint))
    (begin
        (asserts! (>= end start) err-invalid-input)
        (asserts! (is-some (map-get? pets {pet-id: pet-id})) err-pet-not-found)
        (ok (filter map-get? vet-records
            (map unwrap-panic
                (map (lambda (id) (some {pet-id: pet-id, record-id: id}))
                    (sequence start end)))))
    )
)

(define-read-only (get-pet-activities (pet-id uint) (start uint) (end uint))
    (begin
        (asserts! (>= end start) err-invalid-input)
        (asserts! (is-some (map-get? pets {pet-id: pet-id})) err-pet-not-found)
        (ok (filter map-get? activities
            (map unwrap-panic
                (map (lambda (id) (some {pet-id: pet-id, activity-id: id}))
                    (sequence start end)))))
    )
)
